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

var special = ['_id','filename','contentType','length','chunkSize','uploadDate','aliases','metadata','md5','content'];

//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var objs = common.get_payload(req,'objs');
    var ids = [];
    var write_file = function(i) {
        if(i < objs.length) {
            var metadata = {};
            for(var key in objs[i]) {
                if(key != 'content')
                    metadata[key] = objs[i][key];
            }
            metadata.owner = String(req.user._id);
            if (!('property_id' in objs[i]))
                metadata.property_id = "";
            if (!('content' in objs[i]))
                objs[i].content = {};
            var content = JSON.stringify(objs[i].content);
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

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(collection, common.get_payload(req,'filter'), String(req.user._id), res, function(res, err, objs) {
        if (!err) {
            common.get_gridfs_objs(objs, res, common.return);
        } else {
            return res.json({status: res.statusCode, error: JSON.stringify(err)});
        }
    });
});

router.get('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_one(collection, common.get_payload(req,'filter'), String(req.user._id), res, function(res, err, obj) {
        if (!err) {
            common.get_gridfs_objs([obj], res, function(res, err, objs) {
                if (!err) {
                    return res.json({status: 'OK', result: objs[0]});
                } else {
                    return res.json({status: res.statusCode, error: JSON.stringify(err)});
                }
            });
        } else {
            return res.json({status: res.statusCode, error: JSON.stringify(err)});
        }
    });
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_count(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

router.get('/fields/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = common.get_payload(req,'filter');
    var fields = common.get_payload(req,'fields');
    common.query_fields_only(collection, filter, fields, String(req.user._id), res, function(res, err, objs) {
        if (!err) {
            common.get_gridfs_field_objs(objs, fields, res, common.return);
        } else {
            return res.json({status: res.statusCode, error: JSON.stringify(err)});
        }
    });
});

router.get('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_one(collection, {_id: new ObjectID(req.params.id)}, String(req.user._id), res, function(res, err, obj) {
        if (!err) {
            common.get_gridfs_objs([obj], res, function(res, err, objs) {
                if (!err) {
                    return res.json({status: 'OK', result: objs[0]});
                } else {
                    return res.json({status: res.statusCode, error: JSON.stringify(err)});
                }
            });
        } else {
            return res.json({status: res.statusCode, error: JSON.stringify(err)});
        }
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
    common.form_filter(collection, common.get_payload(req,'filter'), String(req.user._id), function(filter) {
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
    var map = function () {
                emit(this.owner,
                     {sum: this.metadata[field],
                      max: this.metadata[field],
                      min: this.metadata[field],
                      count: 1,
                      diff: 0
                     });
              };
    common.stats(collection,req,res,map);
});


router.get('/mapreduce/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.mapreduce(collection,req,res);
});


module.exports = router;
