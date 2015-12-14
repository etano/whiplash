var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var log = require(libs + 'log')(module);
var db = require(libs + 'db/mongo');
var GridStore = require('mongodb').GridStore;
var ObjectID = require('mongodb').ObjectID;
var collection = db.get().collection('fs.files');

var crypto = require('crypto');
function checksum (str) {return crypto.createHash('md5').update(str, 'utf8').digest('hex');}

function concaternate(o1, o2) {
    for (var key in o2) {
        o1[key] = o2[key];
    }
    return o1;
}

var special = ['_id','filename','contentType','length','chunkSize','uploadDate','aliases','metadata','md5'];


//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var ids = [];
    var write_file = function(i) {
        if(i < req.body.length) {
            var metadata = {};
            for(var key in req.body[i]) {
                if(key != 'content')
                    metadata[key] = req.body[i][key];
            }
            metadata.owner = String(req.user._id);
            if (!('property_id' in req.body[i]))
                metadata.property_id = "";
            if (!('content' in req.body[i]))
                req.body[i].content = {};
            var content = JSON.stringify(req.body[i].content);
            var md5 = checksum(content);
            collection.find({md5 : md5, "metadata.property_id" : metadata.property_id}).limit(1).toArray(function (err, objs) {
                if(err) {
                    log.error("Error in count: %s",err.message);
                    write_file(i+1);
                } else if(objs.length > 0) {
                    log.error("Duplicate file with md5: %s",md5);
                    ids.push(objs[0]._id);
                    write_file(i+1);
                } else {
                    var fileId = new ObjectID();
                    var options = { metadata: metadata };
                    var gridStore = new GridStore(db.get(),fileId,String(fileId),'w',options);
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
                                            ids.push(String(fileId));
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
                result: ids
            });
        }
    };
    write_file(0);
});

//
// Query
//

var read_by_name = function(name,cb) {
    var data = null;
    var err = null;
    GridStore.read(db.get(), name, function(err, fileData) {
        if(!err) {
            data = fileData.toString();
        } else {
            log.error("Read error: %s",err.message);
            err = {"message":"Error reading file " + name};
        }
        cb(err,data);
    });
};

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.form_filter(collection,req.body,String(req.user._id), function(filter) {
        collection.find(filter).toArray(function (err, objs) {
            if(!err) {
                if(objs.length > 0) {
                    var items = [];
                    var apply_content = function(i){
                        if (i<objs.length) {
                            read_by_name(String(objs[i]._id),function(err,data){
                                if(!err) {
                                    items.push(concaternate({'content':JSON.parse(data),'_id':objs[i]._id}, objs[i].metadata));
                                    apply_content(i+1);
                                } else {
                                    res.statusCode = 500;
                                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                                    return res.json({ error: 'Server error' });
                                }
                            });
                        } else {
                            log.info("Returning %d objects",items.length);
                            return res.json({
                                status: 'OK',
                                result: items
                            });
                        }
                    };
                    apply_content(0);
                } else {
                    log.info("Objects with filter %s not found",JSON.stringify(filter));
                    return res.json({
                        status: 'OK',
                        result: {}
                    });
                }
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    });
});

router.get('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.form_filter(collection,req.body,String(req.user._id), function(filter) {
        collection.find(filter).limit(1).toArray(function (err, objs) {
            if(!err) {
                if(objs.length > 0) {
                    read_by_name(String(objs[0]._id),function(err,data){
                        if(!err) {
                            log.info("Returning 1 object");
                            return res.json({
                                status: 'OK',
                                result: concaternate({'content':JSON.parse(data),'_id':objs[0]._id}, objs[0].metadata)
                            });
                        } else {
                            res.statusCode = 500;
                            log.error('Internal error(%d): %s',res.statusCode,err.message);
                            return res.json({ error: 'Server error' });
                        }
                    });
                } else {
                    log.info("Object with filter %s not found",JSON.stringify(filter));
                    return res.json({
                        status: 'OK',
                        result: {}
                    });
                }
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    });
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_count(collection,req,res);
});

router.get('/fields/', passport.authenticate('bearer', { session: false }), function(req, res) {
    for(var i=0; i <req.body.fields.length; i++)
        if(!~special.indexOf(req.body.fields[i]))
            req.body.fields[i] = 'metadata.' + req.body.fields[i];
    common.query_fields_only(collection,req,res);
});

router.get('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.form_filter(collection,{_id: new ObjectID(req.params.id)},String(req.user._id), function(filter) {
        collection.find(filter).limit(1).toArray(function (err, objs) {
            if(!err) {
                if(objs.length > 0) {
                    read_by_name(String(objs[0]._id),function(err,data){
                        if(!err) {
                            log.info("Returning 1 object");
                            return res.json({
                                status: 'OK',
                                result: concaternate({'content':JSON.parse(data),'_id':objs[0]._id}, objs[0].metadata)
                            });
                        } else {
                            res.statusCode = 500;
                            log.error('Internal error(%d): %s',res.statusCode,err.message);
                            return res.json({ error: 'Server error' });
                        }
                    });
                } else {
                    log.info("Object with filter %s not found",JSON.stringify(filter));
                    return res.json({
                        status: 'OK',
                        result: {}
                    });
                }
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    });
});

//
// Delete
//

var delete_by_id = function(id, cb) {
    var gridStore = new GridStore(db.get(), id, String(id), 'w');
    gridStore.open(function(err, gs) {
        if(err) {
            log.error('Error opening file: %s',err.message);
            cb(err,gs);
        } else {
            gridStore.unlink(function(err, result) {
                if(err){
                    log.error('Error deleting file: %s',err.message);
                }
                cb(err,result);
            });
        }
    });
};

var delete_by_filter = function(filter,res) {
    var proj = {};
    proj._id = 1;
    collection.find(filter).project(proj).toArray(function(err, objs) {
        if(!err) {
            if(objs.length > 0) {
                var items = [];
                var delete_objs = function(i){
                    if (i<objs.length) {
                        delete_by_id(new ObjectID(objs[i]._id), function(err, data) {
                            if(!err) {
                                delete_objs(i+1);
                            } else {
                                res.statusCode = 500;
                                log.error('Internal error(%d): %s',res.statusCode,err.message);
                                return res.json({ error: 'Server error' });
                            }
                        });
                    } else {
                        log.info("Deleting %d objects",objs.length);
                        return res.json({
                            status: 'OK',
                            result: objs.length
                        });
                    }
                };
                delete_objs(0);
            } else {
                log.info("Objects with filter %s not found",JSON.stringify(filter));
                return res.json({
                    status: 'OK',
                    result: 0
                });
            }
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
};

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.form_filter(collection,req.body,String(req.user._id), function(filter) {
        delete_by_filter(filter,res);
    });
});

router.delete('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.form_filter(collection,{_id: new ObjectID(req.params.id)},String(req.user._id), function(filter) {
        delete_by_filter(filter,res);
    });
});

//
// Map-reduce
//

router.get('/stats/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.stats(collection,req,res);
});

module.exports = router;
