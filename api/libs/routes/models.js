var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var ObjType = require(libs + 'schemas/model');

var log = require(libs + 'log')(module);
var crypto = require('crypto');
function checksum (str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}

var conn = require(libs + 'db/mongoose').connection;
var GridStore = require('mongodb').GridStore;
var ObjectID = require('mongodb').ObjectID;
var collection = conn.db.collection('models');

//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    for(var i=0; i<req.body.length; i++) {
        req.body[i].md5 = checksum(JSON.stringify(req.body[i].content));
    }
    common.validate(ObjType,req,function(err){
        if(err) {
            if(err.name === 'ValidationError') {
                res.statusCode = 400;
                log.error('Validation error(%d): %s', res.statusCode, err.message);
                return res.json({ error: err.toString() });
            } else {
                res.statusCode = 500;
                log.error('Server error(%d): %s', res.statusCode, err.message);
                return res.json({ error: err.toString() });
            }
        } else {
            var ids = [];
            var count = 0;
            var write_file = function() {
                if(count < req.body.length){
                    var metadata = req.body[count].tags;
                    metadata.owner = req.body[count].owner;
                    var content = JSON.stringify(req.body[count].content);
                    var md5 = checksum(content);
                    count++;
                    conn.db.collection('fs.files').count({md5 : md5, "metadata.property_id" : metadata.property_id}, function (err, count) {
                        if(err){
                            log.error("Error in count: %s",err.message);
                            write_file();
                        } else if(count > 0){
                            log.error("Duplicate file with md5: %s",md5);
                            write_file();
                        } else {
                            var fileId = String(new ObjectID());
                            var options = { metadata: metadata };
                            var gridStore = new GridStore(conn.db,fileId,fileId,'w',options);
                            gridStore.open(function(err, gridStore) {
                                if(err){
                                    log.error("Error opening file: %s",err.message);
                                    write_file();
                                } else {
                                    gridStore.write(content, function(err, gridStore) {
                                        if(err){
                                            log.error("Error writing file: %s",err.message);
                                            write_file();
                                        } else {
                                            gridStore.close(function(err, result) {
                                                if(err){
                                                    log.error("Error closing file: %s",err.message);
                                                } else {
                                                    log.info("Wrote file: %s",fileId);
                                                    ids.push({'index':ids.length,'_id':fileId});
                                                }
                                                write_file();
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    log.info("Returning %d files",ids.length);
                    return res.json({
                        status: 'OK',
                        result: {'ids':ids,'n':ids.length}
                    });
                }
            };
            write_file();
        }
    });

});

//
// Query
//

var find_by_id = function(id,cb) {
    var data = null;
    var err = null;
    GridStore.read(conn.db, id, function(err, fileData) {
        if(!err) {
            log.info("Read file: %s",id);
            data = fileData.toString();
        } else {
            log.error("Read error: %s",err.message);
            err = {"message":"Error reading file"+String(id)};
        }
        cb(err,data);
    });
};

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = {};
    for(var key in req.body) {
        if(key !== '_id') {
            if(req.body.hasOwnProperty(key)) {
                filter["metadata."+key] = req.body[key];
            }
        } else {
            filter['_id'] = req.body[key];
        }
    }

    if (req.params.tags_only) {
        common.query(conn.db.collection('fs.files'),filter,res);
    } else {
        conn.db.collection('fs.files').find(filter).toArray(function (err, objs) {
            // Check exists
            if(!objs) {
                log.error("Objects with filter %s not found",JSON.stringify(filter));
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }

            // Put content in response
            var apply_content = function(i){
                if (i<objs.length) {
                    find_by_id(objs[i]['_id'],function(err,data){
                        objs[i]['content'] = JSON.parse(data);
                        apply_content(i+1);
                    });
                } else {
                    // Return object
                    if (!err) {
                        log.info("Returning %d objects",objs.length)
                        return res.json({
                            status: 'OK',
                            result: objs
                        });
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s',res.statusCode,err.message);
                        return res.json({ error: 'Server error' });
                    }
                }
            };
            apply_content(0);
        });
    }
});

router.get('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = {};
    for(var key in req.body) {
        if(key !== '_id') {
            if(req.body.hasOwnProperty(key)) {
                filter["metadata."+key] = req.body[key];
            }
        } else {
            filter['_id'] = req.body[key];
        }
    }
    if (req.params.tags_only) {
        common.query_one(conn.db.collection('fs.files'),filter,res);
    } else {
        conn.db.collection('fs.files').find(filter).limit(1).toArray(function (err, obj) {
            // Check exists
            if(!obj) {
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }

            // Put content in response
            find_by_id(obj['_id'],function(err,data){
                obj['content'] = data;
            });

            // Return object
            if (!err) {
                return res.json({
                    status: 'OK',
                    result: obj
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    }
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = {};
    for(var key in req.body) {
        if(key !== '_id') {
            if(req.body.hasOwnProperty(key)) {
                filter["metadata."+key] = req.body[key];
            }
        } else {
            filter['_id'] = req.body[key];
        }
    }
    common.query_count(conn.db.collection('fs.files'),filter,res);
});

router.get('/field/:field', passport.authenticate('bearer', { session: false }), function(req, res) {
    var field = req.params.field;
    var filter = {};
    for(var key in req.body) {
        if(key !== '_id') {
            if(req.body.hasOwnProperty(key)) {
                filter["metadata."+key] = req.body[key];
            }
        } else {
            filter['_id'] = req.body[key];
        }
    }
    common.query_field_only(conn.db.collection('fs.files'),field,filter,res);
});

router.get('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = {_id:req.params.id};
    if (req.params.tags_only) {
        common.query_one(conn.db.collection('fs.files'),filter,res);
    } else {
        conn.db.collection('fs.files').find(filter).limit(1).toArray(function (err, obj) {
            // Check exists
            if(!obj) {
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }

            // Put content in response
            find_by_id(obj['_id'],function(err,data){
                obj['content'] = data;
            });

            // Return object
            if (!err) {
                return res.json({
                    status: 'OK',
                    result: obj
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    }
});

//
// Delete
//

var delete_by_id = function(id,req,res,cb) {
    var err = null;
    var data = null;
    var gridStore = new GridStore(conn.db, id, id, 'w');
    gridStore.open(function(open_err, gs) {
        if(err) {
            log.error('Error opening file: %s',open_err.message);
            err = open_err;
            cb(err,data);
        } else if(gridStore.metadata.owner !== String(req.user._id)) {
            log.error('Wrong owner: %s',String(req.user._id));
            err = {'message':'You are not the owner of this file'};
            cb(err,data);
        } else {
            gridStore.unlink(function(unlink_err, result) {
                if(unlink_err){
                    log.error('Error deleting file: %s',unlink_err.message);
                    err = unlink_err;
                }
                cb(err,data);
            });
        }
    });
};

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var proj = {};
    proj._id = 1;
    conn.db.collection('fs.files').find(req.body).project(proj).toArray(function(err, objs) {
        // Check exists
        if(!objs) {
            log.error("Objects with filter %s not found",JSON.stringify(filter));
            res.statusCode = 404;
            return res.json({ error: 'Not found' });
        }

        // Delete objects
        var delete_objs = function(i){
            if (i<objs.length) {
                delete_by_id(objs[i]._id,req,res,function(e, obj) {
                    if (e) {
                        err = e;
                        i = objs.length;
                    }
                    delete_objs(i+1);
                });
            } else {
                // Return object
                if (!err) {
                    log.info("Deleting %d objects",objs.length)
                    return res.json({
                        status: 'OK',
                        result: objs.length
                    });
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    return res.json({ error: err.message });
                }
            }
        };
        delete_objs(0);
    });
});

router.delete('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    delete_by_id(req.params.id,res,function(err,obj) {
        // Return object
        if (!err) {
            log.info("Deleting object with id %s",req.params.id)
            return res.json({
                status: 'OK',
                result: obj
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

//
// GridFS
//

router.get('/file_id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    GridStore.read(conn.db, req.params.id, function(err, fileData) {
        if(!err) {
            log.info("Read file: %s",req.params.id);
            return res.json({
                status: 'OK',
                result: fileData.toString()
            });
        } else {
            log.error("Read error: %s",err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

module.exports = router;
