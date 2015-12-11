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
var GridStore = require('mongodb').GridStore;

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
    common.form_filter(collection,{_id: new ObjectID(req.params.id)},String(req.user._id), function(filter) {
        collection.find(filter).limit(1).toArray(function (err, obj) {
            if(!obj) {
                log.info('Job with id %s not found',res.params.id);
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }
            if (!err) {
                var property_ids = obj[0].ids;
                var properties_collection = db.get().collection('properties');
                common.form_filter(properties_collection,{_id:{'$in':property_ids},'status':3},String(req.user._id), function(filter) {
                    properties_collection.find(filter).project({'output_model_id':1}).toArray(function (err, objs) {
                        if(!objs) {
                            log.info('Properties with ids %s not found',JSON.stringify(property_ids));
                            res.statusCode = 404;
                            return res.json({ error: 'Not found' });
                        }
                        if (!err) {
                            var model_ids = []
                            for(var i=0; i<objs.length; i++) {
                                model_ids.push(objs[i]['output_model_id'])
                            }
                            var models_collection = db.get().collection('fs.files');
                            common.form_filter(models_collection,{_id: {'$in': model_ids}},String(req.user._id), function(filter) {
                                models_collection.find(filter).toArray(function (err, objs) {
                                    if(!err) {
                                        if(objs.length > 0) {
                                            var items = [];
                                            var apply_content = function(i){
                                                if (i<objs.length) {
                                                    GridStore.read(db.get(), String(objs[i]._id), function(err, data) {
                                                        if(!err) {
                                                            var tmp = {'content':JSON.parse(data.toString()),'_id':objs[i]._id};
                                                            for (var key in objs[i].metadata) {
                                                                tmp[key] = objs[i].metadata[key];
                                                            }
                                                            items.push(tmp);
                                                            apply_content(i+1);
                                                        } else {
                                                            res.statusCode = 500;
                                                            log.error('Internal error(%d): %s',res.statusCode,err.message);
                                                            return res.json({ error: 'Server error' });
                                                        }
                                                    });
                                                } else {
                                                    var file_name = 'models.json';
                                                    require("fs").writeFile(file_name,JSON.stringify(items),function (err) {
                                                        if(!err){
                                                            log.info("Downloading %d objects",items.length);
                                                            return res.download(file_name);
                                                        } else {
                                                            res.statusCode = 500;
                                                            log.error('Internal error(%d): %s',res.statusCode,err.message);
                                                            return res.json({ error: 'Server error' });
                                                        }
                                                    });
                                                }
                                            };
                                            apply_content(0);
                                        } else {
                                            log.info("Models with filter %s not found",JSON.stringify(filter));
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
                        } else {
                            res.statusCode = 500;
                            log.error('Internal error(%d): %s',res.statusCode,err.message);
                            return res.json({ error: 'Server error' });
                        }
                    });
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    });    
});

router.get('/:id/log', passport.authenticate('bearer', { session: false }), function(req, res) {

    //TODO: use property id to directly query properties collection for log of
    //specific property 

    common.form_filter(collection,{_id: new ObjectID(req.params.id)},String(req.user._id), function(filter) {
        collection.find(filter).limit(1).toArray(function (err, obj) {
            if(!obj) {
                log.info('Job with id %s not found',res.params.id);
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }
            if (!err) {
                var property_id = obj[0].ids[req.query.id];
                var properties_collection = db.get().collection('properties');
                common.form_filter(properties_collection,{'_id': property_id,'status':3},String(req.user._id), function(filter) {
                    properties_collection.find(filter).project({'log':1}).toArray(function (err, objs) {
                        if(!objs) {
                            log.info('Properties with ids %s not found',JSON.stringify(property_ids));
                            res.statusCode = 404;
                            return res.json({ error: 'Not found' });
                        }
                        if (!err) {
                            log.info("Fetching log of property " + property_id);
                            return res.send(objs[0]['log']);
                        }
                    });
                });
            }
        });
    });
});

router.get('/:id/explore', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.form_filter(collection,{_id: new ObjectID(req.params.id)},String(req.user._id), function(filter) {
        collection.find(filter).limit(1).toArray(function (err, obj) {
            if(!obj) {
                log.info('Job with id %s not found',res.params.id);
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }
            if (!err) {
                var property_ids = obj[0].ids
                var properties_collection = db.get().collection('properties');
                common.form_filter(properties_collection,{_id:{'$in':property_ids},'status':3},String(req.user._id), function(filter) {
                    properties_collection.find(filter).toArray(function (err, objs) {
                        if(!objs) {
                            log.info('Properties with ids %s not found',JSON.stringify(property_ids));
                            res.statusCode = 404;
                            return res.json({ error: 'Not found' });
                        }
                        if (!err) {

                            log.info("Exploring job " + req.params.id);

                            var runs = [];

                            //TODO: send property id rather than just index

                            for(var i = 0; i < objs.length; i++) {
                                var run = {};

                                run.id = i;
                                run.app = objs[i].executable_id;
                                run.model = objs[i].input_model_id;

                                var params = [];
                                for(var key in objs[i].params)
                                    params.push({'name' : key, 'value' : objs[i].params[key]});
                                run.params = params;

                                runs.push(run);
                            }

                            return res.json({
                                status: 'OK',
                                result: {
                                    count: runs.length,
                                    runs: runs
                                }
                            });
                        }
                    });
                });
            }
        });
    });
});

router.get('/:id/table', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: backend
    // Return table configuration of the batch.
    //
    var example_query = { model : "asian",
        container : "ethz_uevol",
        parameters : [
            [ { attr : "name", value : "Energy" }, { attr : "value", value : "41.5" } ],  // parameter Energy
            [ { attr : "name", value : "Seed"   }, { attr : "value", value : "39"   } ],  // parameter Seed
        ]
    };

    return res.json({
        status: 'OK',
        result: {
            query: example_query
        }
    });
});

router.get('/:id/script', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: backend
    // Return query-script of the batch.
    //
    var example_code = { value : "for i in range(10000): wdb.queue({\"params\": {\"seed\": i, \"hx\": -1, \"Ttot\": 500, \"nsteps\": 400}, \"input_model_id\": model_id, \"container_name\": container_name, \"timeout\": 666})" };

    return res.json({
        status: 'OK',
        result: {
            query: example_code
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
