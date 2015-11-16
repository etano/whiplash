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

var db = require(libs + 'db/mongo');
var GridStore = require('mongodb').GridStore;
var ObjectID = require('mongodb').ObjectID;
var collection = db.get().collection('fs.files');

var special = ['_id','filename','contentType','length','chunkSize','uploadDate','aliases','metadata','md5'];

//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.validate(ObjType,req,function(err) {
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
            var write_file = function(i) {
                if(i < req.body.length) {
                    var metadata = req.body[i].tags;
                    metadata.owner = req.body[i].owner;
                    var content = JSON.stringify(req.body[i].content);
                    var md5 = checksum(content);
                    collection.find({md5 : md5, "metadata.property_id" : metadata.property_id}).limit(1).toArray(function (err, objs) {
                        if(err) {
                            log.error("Error in count: %s",err.message);
                            write_file(i+1);
                        } else if(objs.length > 0) {
                            log.error("Duplicate file with md5: %s",md5);
                            ids.push({'index':ids.length,'_id':objs[0]._id});
                            write_file(i+1);
                        } else {
                            var fileId = String(new ObjectID());
                            var options = { metadata: metadata };
                            var gridStore = new GridStore(db.get(),fileId,fileId,'w',options);
                            gridStore.open(function(err, gridStore) {
                                if(err) {
                                    log.error("Error opening file: %s",err.message);
                                    write_file(i+1);
                                } else {
                                    gridStore.write(content, function(err, gridStore) {
                                        if(err) {
                                            log.error("Error writing file: %s",err.message);
                                            write_file(i+1);
                                        } else {
                                            gridStore.close(function(err, result) {
                                                if(err) {
                                                    log.error("Error closing file: %s",err.message);
                                                } else {
                                                    ids.push({'index':ids.length,'_id':fileId});
                                                }
                                                write_file(i+1);
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    log.info("Commited %d objects",ids.length);
                    return res.json({
                        status: 'OK',
                        result: {'ids':ids,'n':ids.length}
                    });
                }
            };
            write_file(0);
        }
    });

});

//
// Query
//

var find_by_id = function(id,cb) {
    var data = null;
    var err = null;
    GridStore.read(db.get(), id, function(err, fileData) {
        if(!err) {
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
    filter["metadata.owner"] = String(req.user._id);
    if (req.params.tags_only) {
        common.query(collection,filter,res);
    } else {
        collection.find(filter).toArray(function (err, objs) {
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
                        log.info("Returning %d objects",objs.length);
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
    filter["metadata.owner"] = String(req.user._id);
    if (req.params.tags_only) {
        common.query_one(collection,filter,res);
    } else {
        collection.find(filter).limit(1).toArray(function (err, obj) {
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
    filter["metadata.owner"] = String(req.user._id);
    common.query_count(collection,filter,res);
});

router.get('/fields/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = {};
    for(var key in req.body.filter) {
        if(key !== '_id') {
            if(req.body.filter.hasOwnProperty(key)) {
                filter["metadata."+key] = req.body.filter[key];
            }
        } else {
            filter['_id'] = req.body.filter[key];
        }
    }
    filter["metadata.owner"] = String(req.user._id);
    var fields = req.body.fields;
    for(var i=0; i <fields.length; i++)
        if(!~special.indexOf(fields[i]))
            fields[i] = 'metadata.' + fields[i];
    common.query_fields_only(collection,filter,fields,res);
});

router.get('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = {_id:req.params.id};
    filter["metadata.owner"] = String(req.user._id);    
    if (req.params.tags_only) {
        common.query_one(collection,filter,res);
    } else {
        collection.find(filter).limit(1).toArray(function (err, obj) {
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
    var gridStore = new GridStore(db.get(), id, id, 'w');
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
    req.body["metadata.owner"] = String(req.user._id);
    collection.find(req.body).project(proj).toArray(function(err, objs) {
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
// Map-reduce
//

router.get('/stats/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.stats(collection,req,res);
});

module.exports = router;
