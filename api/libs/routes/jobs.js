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

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection,req,res);
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
                        db.get().collection('properties').group({'status':1},{'_id':{'$in':ids}},{'count':0},"function(obj,prev) { prev.count++; }", function (err, counts) {
                            var stats_i = {time: objs[i].timestamp.toLocaleString(), batch_id: objs[i]._id};
                            for (var k=0; k<counts.length; k++) {
                                if (counts[k].status === 0) {
                                    stats_i.togo = counts[k].count;
                                } else if (counts[k].status === 3) {
                                    stats_i.done = counts[k].count;
                                } else {
                                    if (stats_i.now) {
                                        stats_i.now += counts[k].count;
                                    } else {
                                        stats_i.now = counts[k].count;
                                    }
                                }
                                if (!stats_i.now) {
                                    stats_i.now = 0;
                                }
                            }
                            stats.push(stats_i);
                            get_stats(i+1);
                        });
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
