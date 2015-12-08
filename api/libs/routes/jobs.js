var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('jobs');
var ObjType = require(libs + 'schemas/job');
var ObjectID = require('mongodb').ObjectID;

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(ObjType,collection,req,res);
});

router.post('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    req.body = {'_id':req.params.id};
    common.form_filter(collection,req.body,String(req.user._id), function(filter) {
        collection.find(filter).limit(1).toArray(function (err, objs) {
            if (!err) {
                if (objs.length > 0) {
                    delete objs[0].submitted;
                    delete objs[0]._id;
                    delete objs[0].timestamp;
                    objs[0].name = objs[0].name + '_copy';
                    req.body = objs;
                    common.validate(ObjType,req, function(err) {
                        if(err) {
                            if(err.name === 'ValidationError') {
                                log.error('Validation error(%d): %s', 400, err.message);
                                return res.json({ status: 400, error: err.toString() });
                            } else {
                                log.error('Server error(%d): %s', 500, err.message);
                                return res.json({ status: 500, error: err.toString() });
                            }
                        } else {
                            collection.insertOne(req.body[0], function(err, r) {
                                if (!err) {
                                    return res.json({
                                        status: 'OK',
                                        result: {
                                            name: req.body[0].name,
                                            time: req.body[0].timestamp.toLocaleString(),
                                            batch_id: r.insertedId,
                                            script: req.body[0].script,
                                            submitted: req.body[0].submitted
                                        }
                                    });
                                } else {
                                    log.error('Write error: %s', err.toString());
                                    return res.json({ status: 500, error: 'Server error' });
                                }
                            });
                        }
                    });
                } else {
                    log.error('Not found error: %s', err.toString());
                    return res.json({ status: 404, error: err.toString() });
                }
            } else {
                log.error('Server error: %s', err.toString());
                return res.json({ status: 500, error: 'Server error' });
            }
        });
    });
});

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection,req,res);
});

router.delete('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete_id(collection,req,res);
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_count(collection,req,res);
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(collection,req,res);
});

router.get('/fields/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_fields_only(collection,req,res);
});

router.get('/stats/', passport.authenticate('bearer', { session: false }), function(req, res) {
    // Get all jobs submitted by user
    req.body = {};
    common.form_filter(collection,req.body,String(req.user._id), function(filter) {
        collection.find(filter).toArray(function (err, objs) {
            if (!err) {
                // Count properties of different statuses for each job
                var stats = [];
                var get_stats = function(i) {
                    if (i < objs.length) {
                        var ids = [];
                        for (var j=0; j<objs[i]['ids'].length; j++) {
                            ids.push(new ObjectID(objs[i]['ids'][j]));
                        }
                        var stats_i = {name: objs[i].name, time: objs[i].timestamp.toLocaleString(), batch_id: objs[i]._id, togo: 0, done: 0, now: 0, submitted: objs[i].submitted};
                        if(ids.length > 0) {
                            db.get().collection('properties').group({'status':1},{'_id':{'$in':ids}},{'count':0},"function(obj,prev) { prev.count++; }", function (err, counts) {
                                for (var k=0; k<counts.length; k++) {
                                    if (counts[k].status === 0) {
                                        stats_i.togo += counts[k].count;
                                    } else if (counts[k].status === 3) {
                                        stats_i.done += counts[k].count;
                                    } else {
                                        stats_i.now += counts[k].count;
                                    }
                                }
                                stats.push(stats_i);
                                get_stats(i+1);
                            });
                        } else {
                            stats.push(stats_i);
                            get_stats(i+1);
                        }
                    } else {
                        // Return counts
                        return res.json({
                            status: 'OK',
                            result: {
                                count: stats.length,
                                stats: stats
                            }
                        });
                    }
                };
                get_stats(0);
            } else {
                return res.json({
                    status: 'OK',
                    result: {
                        count: 0,
                        stats: []
                    }
                });
            }
        });
    });



});

router.get('/:id/download', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: backend
    // Need to issue file transfer here
    return res.json({
        status: 'OK',
        result: {
            data: req.params.id
        }
    });
});

router.get('/:id/log', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: backend
    // Need to issue file transfer here
    return res.json({
        status: 'OK',
        result: {
            data: req.params.id
        }
    });
});

router.get('/:id/explore', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: backend
    return res.json({
        status: 'OK',
        result: {
            count: 3,
            runs: [
                       { id: 0, app: "xxx", model: "test", params: [ { name : "energy", value : "-5"  }, { name : "seed", value : "17" } ] },
                       { id: 1, app: "xxx", model: "test", params: [ { name : "energy", value : "-45" } ]                                  },
                       { id: 2, app: "xxx", model: "test", params: [ { name : "energy", value : "-7"  }, { name : "seed", value : "23" } ] }
                  ]
        }
    });
});

router.post('/compose', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: backend
    // Accepts list of params and their constraints from GUI. Returns batch id.
    //
    // Input example:
    //
    // { model : <model name>,
    //   container : <container name>,
    //   parameters : [
    //                  [ { attr : "name", value : "Energy" }, { attr : <constraint name>, value : <constraint value> } ],  // parameter 0
    //                  [ { attr : "name", value : "Seed"   }, { attr : <constraint name>, value : <constraint value> } ]   // parameter 1
    //                ]
    // }

    return res.json({
        status: 'OK',
        result: {
            batch_id: 1
        }
    });
});

router.post('/script', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: backend
    // Accepts the source code of a script

    return res.json({
        status: 'OK',
        result: {
            batch_id: 1
        }
    });
});

module.exports = router;
