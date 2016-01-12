var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var models_routes = require(libs + 'routes/models');
var property = require(libs + 'schemas/property');
var GridStore = require('mongodb').GridStore;
var executables = db.get().collection('executables');
var models = db.get().collection('fs.files');
var properties = db.get().collection('properties');

//
// Helper functions
//

function get_ids(models_filter, executables_filter, user_id, res, cb) {
    // Find models
    common.query_fields_only(models, models_filter, ['_id'], user_id, res, function(res, err, result) {
        if (!err) {
            var model_ids = [];
            for (var i=0; i<result.length; i++) {
                model_ids.push(String(result[i]['_id']));
            }
            // Find executable
            common.query_fields_only(executables, executables_filter, ['_id'], user_id, res, function(res, err, result) {
                if (!err) {
                    var executable_id = "";
                    if (result.length > 0) {
                        executable_id = String(result[0]['_id']);
                    }
                    cb(model_ids, executable_id, res);
                } else {
                    common.return(res, err, 0);
                }
            });
        } else {
            common.return(res, err, 0);
        }
    });
}

function form_property_filter(model_ids, executable_id, params, user_id, res, cb) {
    var property_filter = {'executable_id':executable_id,'input_model_id':{'$in':model_ids}};
    for (var key in params) {
        property_filter['params.'+key] = params[key];
    }
    cb(property_filter, res);
}

function form_results_filter(property_filter, user_id, res, cb) {
    property_filter["status"] = "resolved";
    common.query_fields_only(properties, property_filter, ['output_model_id'], user_id, res, function(res, err, result) {
        if(!err) {
            var model_ids = [];
            for (var i=0; i<result.length; i++) {
                model_ids.push(result[i]['output_model_id']);
            }
            var results_filter = {'_id':{"$in":model_ids}};
            cb(results_filter, res);
        } else {
            common.return(res, err, 0);
        }
    });
}

function get_property_stats(property_filter, user_id, res, cb) {
    common.query_fields_only(properties, property_filter, ['_id'], user_id, res, function(res, err, result) {
        if (!err) {
            var ids = [];
            for (var i=0; i<result.length; i++) {
                ids.push(result[i]['_id']);
            }
            var stats = {'resolved':0, 'running':0, 'errored':0, 'timedout':0, 'unresolved':0, 'total': 0};
            properties.group(['status'],{'_id':{'$in':ids}},{'count':0},"function(obj,prev) { prev.count++; }", function (err, counts) {
                for (var i=0; i<counts.length; i++) {
                    if (counts[i].status === "resolved") {
                        stats.resolved += counts[i].count;
                    } else if (counts[i].status === "running") {
                        stats.running += counts[i].count;
                    } else if (counts[i].status === "errored") {
                        stats.errored += counts[i].count;
                    } else if (counts[i].status === "timedout") {
                        stats.timedout += counts[i].count;
                    } else {
                        stats.unresolved += counts[i].count;
                    }
                    stats.total += counts[i].count;
                }
                cb(stats, res);
            });
        } else {
            common.return(res, err, 0);
        }
    });
}

//
// Submit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filters = common.get_payload(req,'filters');
    var user_id = String(req.user._id);
    get_ids(filters['model'], filters['executable'], user_id, res, function(model_ids, executable_id, res) {
        var props = [];
        // Form properties
        for (var i=0; i<model_ids.length; i++) {
            for (var j=0; j<filters['n_rep']; j++) {
                var prop = {'executable_id':executable_id,'input_model_id':model_ids[i],'timeout':3600,'params':{}}; // FIXME: Hard-coded timeout
                for(var key in filters['params']) {
                    prop['params'][key] = filters['params'][key];
                }
                prop['params']['seed'] = j;
                props.push(prop);
            }
        }
        // Commit properties
        common.commit(property, properties, props, user_id, res, function(res, err, result) {
            // Get property statistics
            var property_filter = {'_id':{'$in':result}};
            console.log(property_filter);
            get_property_stats(property_filter, user_id, res, function(stats, res) {
                // Get results
                property_filter['status'] = "resolved";
                form_results_filter(property_filter, user_id, res, function(results_filter, res) {
                    console.log(results_filter);
                    if (filters['fields']) {
                        common.query_fields_only(models, results_filter, filters['fields'], user_id, res, function(res, err, objs) {
                            if (!err) {
                                common.get_gridfs_field_objs(objs, filters['fields'], res, function(res, err, objs) {
                                    common.return(res, err, {'stats': stats, 'results': objs});
                                });
                            } else {
                                common.return(res, err, 0);
                            }
                        });
                    } else {
                        common.query(models, results_filter, user_id, res, function(res, err, objs) {
                            if (!err) {
                                common.get_gridfs_objs(objs, res, function(res, err, objs) {
                                    common.return(res, err, {'stats': stats, 'results': objs});
                                });
                            } else {
                                common.return(res, err, 0);
                            }
                        });
                    }
                });
            });
        });
    });
});

//
// Retrieve
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filters = common.get_payload(req,'filters');
    var user_id = String(req.user._id);
    get_ids(filters['model'], filters['executable'], user_id, res, function(model_ids, executable_id, res) {
        form_property_filter(model_ids, executable_id, filters['params'], user_id, res, function(property_filter, res) {
            common.query(properties, property_filter, user_id, res, common.return);
        });
    });
});

router.get('/count', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filters = common.get_payload(req,'filters');
    var user_id = String(req.user._id);
    get_ids(filters['model'], filters['executable'], user_id, res, function(model_ids, executable_id, res) {
        form_property_filter(model_ids, executable_id, filters['params'], user_id, res, function(property_filter, res) {
            common.query_count(properties, property_filter, user_id, res, common.return);
        });
    });
});

router.get('/stats', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filters = common.get_payload(req,'filters');
    var user_id = String(req.user._id);
    get_ids(filters['model'], filters['executable'], user_id, res, function(model_ids, executable_id, res) {
        form_property_filter(model_ids, executable_id, filters['params'], user_id, res, function(property_filter, res) {

        });
    });
});

router.get('/results', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filters = common.get_payload(req,'filters');
    var user_id = String(req.user._id);
    get_ids(filters['model'], filters['executable'], user_id, res, function(model_ids, executable_id, res) {
        form_property_filter(model_ids, executable_id, filters['params'], user_id, res, function(property_filter, res) {
            form_results_filter(property_filter, user_id, res, function(results_filter, res) {
                if (filters['fields']) {
                    common.query_fields_only(models, results_filter, filters['fields'], user_id, res, function(res, err, objs) {
                        if (!err) {
                            common.get_gridfs_field_objs(objs, filters['fields'], res, common.return);
                        } else {
                            common.return(res, err, 0);
                        }
                    });
                } else {
                    common.query(models, results_filter, user_id, res, function(res, err, objs) {
                        if (!err) {
                            common.get_gridfs_objs(objs, res, common.return);
                        } else {
                            common.return(res, err, 0);
                        }
                    });
                }
            });
        });
    });
});

router.get('/results/count', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filters = common.get_payload(req,'filters');
    var user_id = String(req.user._id);
    get_ids(filters['model'], filters['executable'], user_id, res, function(model_ids, executable_id, res) {
        form_property_filter(model_ids, executable_id, filters['params'], user_id, res, function(property_filter, res) {
            form_results_filter(property_filter, user_id, res, function(results_filter, res) {
                common.query_count(models, results_filter, user_id, res, common.return);
            });
        });
    });
});

module.exports = router;
