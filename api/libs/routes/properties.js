var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('properties');
var ObjType = require(libs + 'schemas/property');

//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
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
        }
        else {
            common.commit(collection,req,res);
        }
    });
});

//
// Query
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body;
    common.query(collection,filter,res);
});

router.get('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body;
    common.query_one(collection,filter,res);
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body;
    common.query_count(collection,filter,res);
});

router.get('/field/:field', passport.authenticate('bearer', { session: false }), function(req, res) {
    var field = req.params.field;
    var filter = req.body;
    common.query_field_only(collection,field,filter,res);
});

router.get('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = {_id:req.params.id};
    common.query_one(collection,filter,res);
});

//
// Update
//

router.put('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update(collection,req,res);
});

router.put('/batch', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.batch_update(collection,req,res);
});

router.put('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update_one(collection,req,res);
});

router.put('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update_id(collection,req,res);
});

//
// Find and update
//

router.post('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_one_and_update(collection,req,res);
});

router.post('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_id_and_update(collection,req,res);
});

//
// Delete
//

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection,req,res);
});

router.delete('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete_id(collection,req,res);
});

//
// Map-reduce
//

router.get('/stats/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.stats(collection,req,res);
});

router.get('/avg_per_dif/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.avg_per_dif(collection,req,res);
});

//
// Special
//

var crypto = require('crypto');

router.put('/work_batch_atomic/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var time_limit = req.body.time_limit;
    var worker_id = req.body.worker_id;
    var job_limit = req.body.job_limit;

    var now = new Date();
    var resolve_by = time_limit + Math.ceil(now.getTime()/1000);
    var worker_tag = crypto.randomBytes(32).toString('hex');

    // Reserve block
    var filter = {"status":0,"timeout":{"$lt":time_limit}};
    var update = {"status":1,"worker_tag":worker_tag,"resolve_by":resolve_by};
    collection.count(filter,function(err, count) {
        if(!err) {
            if(count == 0) {
                return res.json({
                    status: 'OK',
                    result: []
                });
            } else {
                var arr = [];
                for(var i=0; i<job_limit; i++) {
                    arr.push({updateOne: {filter: filter, update: {'$set':update}}});
                }
                collection.bulkWrite(arr,{w:1},function(err,result) {
                    if (result.ok) {
                        log.info("%d objects reserved for worker %d work batch", result.modifiedCount, worker_id);

                        // Compose work batch
                        var work = [];
                        filter = {"worker_tag":worker_tag};
                        collection.find(filter).toArray(function(err, objs) {
                            if (!err) {
                                var time_left = time_limit;
                                var ids = [];
                                var unused_ids = [];
                                for(var i=0; i<objs.length; i++) {
                                    var timeout = objs[i]["timeout"];
                                    if(timeout < time_left){
                                        time_left -= timeout;
                                        ids.push(objs[i]["_id"]);
                                        work.push(objs[i]);
                                    } else {
                                        unused_ids.push(objs[i]["_id"]);
                                    }
                                }

                                // Release unused work
                                update = {"status":0,"worker_tag":-1};
                                collection.updateMany({'_id': {'$in': unused_ids}}, {'$set':update}, {w:1}, function (err, result) {
                                    if (!err) {
                                        log.info("%d objects released for worker %d work batch", result.modifiedCount, worker_id);
                                        log.info("%d objects given to worker %d work batch", work.length, worker_id);
                                        return res.json({
                                            status: 'OK',
                                            result: work
                                        });
                                    } else {
                                        log.error('Error releasing work for worker %d: %s', worker_id, err.message);
                                        return res.json({ error: 'Server error' });
                                    }
                                });
                            } else {
                                log.error('Error finding reserved work for worker %d: %s', worker_id, err.message);
                                return res.json({ error: 'Server error' });
                            }
                        });
                    } else {
                        log.error('Error reserving work for worker %d: %s', worker_id, err.message);
                        return res.json({ error: 'Server error' });
                    }
                });
            }
        } else {
            log.error('Error counting work for worker %d: %s', worker_id, err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

router.put('/work_batch/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var time_limit = req.body.time_limit;
    var filter = {"status":0,"timeout":{"$lt":time_limit}};
    collection.find(filter).limit(1000).toArray(function(err, objs) {
        var time_left = time_limit;
        var ids = [];
        var work = [];
        for(var i=0; i<objs.length; i++) {
            var timeout = objs[i]["timeout"];
            if(timeout < time_left){
                time_left -= timeout;
                ids.push(objs[i]["_id"]);
                work.push(objs[i]);
            }
        }
        if (!err) {
            var now = new Date();
            var resolve_by = time_limit + Math.ceil(now.getTime()/1000);
            var update = {"status":1,"resolve_by":resolve_by};
            collection.updateMany({'_id': {'$in': ids}}, {'$set':update}, {w:1}, function (err, result) {});
            return res.json({
                status: 'OK',
                result: work
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

module.exports = router;
