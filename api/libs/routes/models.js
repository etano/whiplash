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

//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    global.timer.get_timer('commit_models').start();
    log.debug('commit models');
    var user_id = String(req.user._id);
    var objs = common.get_payload(req,'objs');
    var ids = [];
    var write_file = function(i) {
        if(i < objs.length) {
            var metadata = {};
            for(var key in objs[i]) {
                if(key !== 'content') {
                    metadata[key] = objs[i][key];
                }
            }
            metadata.owner = user_id;
            if (!('property_id' in objs[i])) {
                metadata.property_id = "";
            }
            if (!('content' in objs[i])) {
                objs[i].content = {};
            }
            if (objs[i].hasOwnProperty('_id')) {
                delete objs[i]._id;
            }
            metadata.md5 = common.hash(objs[i]);
            common.query(collection, {"md5":metadata.md5, "property_id":metadata.property_id}, ['_id'], user_id, res, function(res, err, prev_objs) {
                if(err) {
                    log.error("Error in count: %s",err.message);
                    write_file(i+1);
                } else if(prev_objs.length > 0) {
                    log.error("Duplicate file with md5: %s",metadata.md5);
                    ids.push(prev_objs[0]._id);
                    write_file(i+1);
                } else {
                    var fileId = new ObjectID();
                    var options = { metadata: metadata };
                    var gridStore = new GridStore(db.get(),fileId, String(fileId), 'w', options);
                    gridStore.open(function(err, gridStore) {
                        if(err) {
                            log.error("Error opening file: %s",err.message);
                            write_file(i+1);
                        } else {
                            gridStore.write(JSON.stringify(objs[i].content), function(err, gridStore) {
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
            global.timer.get_timer('commit_models').stop();
            common.return(res, 0, ids);
        }
    };
    write_file(0);
});

//
// Query
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = common.get_payload(req,'filter');
    var fields = common.get_payload(req,'fields');
    common.query(collection, filter, fields, String(req.user._id), res, function(res, err, objs) {
        if (!err) {
            common.get_gridfs_objs(objs, fields, res, common.return);
        } else {
            common.return(res, err, 0);
        }
    });
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.count(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

//
// Update
//

router.put('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update(collection, common.get_payload(req,'filter'), common.get_payload(req,'update'), String(req.user._id), res, common.return);
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
                                common.return(res, err, 0);
                            }
                        });
                    } else {
                        log.debug('deleted %d objects', objs.length);
                        common.return(res, 0, objs.length);
                    }
                };
                delete_objs(0);
            } else {
                common.return(res, 0, 0);
            }
        } else {
            common.return(res, err, 0);
        }
    });
};

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.form_filter(collection, common.get_payload(req,'filter'), String(req.user._id), function(filter) {
        delete_by_filter(filter,res);
    });
});

//
// Map-reduce
//

router.get('/stats/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var map = function () {
                  emit(this.owner, {
                      sum: this.metadata[field],
                      max: this.metadata[field],
                      min: this.metadata[field],
                      count: 1,
                      diff: 0
                  });
              };
    common.stats(collection, common.get_payload(req,'filter'), common.get_payload(req,'field'), map, String(req.user._id), res, common.return);
});


router.get('/mapreduce/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.mapreduce(collection,req,res);
});


module.exports = router;
