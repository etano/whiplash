var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var models_routes = require(libs + 'routes/models');
//var collection = db.get().collection('properties');
var property = require(libs + 'schemas/property');
var GridStore = require('mongodb').GridStore;
var executables = db.get().collection('executables');
var models = db.get().collection('fs.files');
var properties = db.get().collection('properties');

//
// Helper functions
//

function get_ids(filters, user_id, res, cb) {
    // Find models
    common.query_fields_only(models, filters['model'], ['_id'], user_id, res, function(res, err, result) {
        if (!err) {
            var model_ids = [];
            for (var i=0; i<result.length; i++) {
                model_ids.push(String(result[i]['_id']));
            }
            // Find executable
            common.query_fields_only(executables, filters['executable'], ['_id'], user_id, res, function(res, err, result) {
                if (!err) {
                    var executable_id = -1;
                    if (result.length > 0) {
                        executable_id = String(result[0]['_id']);
                    }
                    cb(model_ids, executable_id, user_id, res);
                } else {
                    return res.json({status: res.statusCode, error: JSON.stringify(err)});
                }
            });
        } else {
            return res.json({status: res.statusCode, error: JSON.stringify(err)});
        }
    });
}

function form_property_filter(filters, user_id, res, cb) {
    get_ids(filters, user_id, res, function(model_ids, executable_id, user_id, res) {
        // Form property filter
        var property_filter = {'executable_id':executable_id,'input_model_id':{'$in':model_ids}};
        for (var key in filters['params']) {
            property_filter['params.'+key] = filters['params'][key];
        }
        cb(property_filter, user_id, res);
    });
}

function form_results_filter(filters, user_id, res, cb) {
    form_property_filter(filters, user_id, res, function(property_filter, user_id, res) {
        property_filter["status"] = "resolved";
        // Get output model ids
        common.query_fields_only(properties, property_filter, ['output_model_id'], user_id, res, function(res, err, result) {
            if(!err) {
                var model_ids = [];
                for (var i=0; i<result.length; i++) {
                    model_ids.push(result[i]['output_model_id']);
                }
                var results_filter = filters['results'];
                results_filter['_id'] = {"$in":model_ids};
                var results_fields = [];
                if(filters['fields']) {
                    results_fields = filters['fields'];
                }
                cb(results_filter, results_fields, user_id, res);
            } else {
                return res.json({status: res.statusCode, error: JSON.stringify(err)});
            }
        });
    });
}

//
// Submit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filters = common.get_payload(req,'filters');
    get_ids(filters, String(req.user._id), res, function(model_ids, executable_id, user_id, res) {
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
        common.commit(property, properties, props, user_id, res, common.return);
    });
});

//
// Retrieve
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    form_property_filter(common.get_payload(req,'filters'), String(req.user._id), res, function(property_filter, user_id, res) {
        common.query(properties, property_filter, user_id, res, common.return);
    });
});

router.get('/count', passport.authenticate('bearer', { session: false }), function(req, res) {
    form_property_filter(common.get_payload(req,'filters'), String(req.user._id), res, function(property_filter, user_id, res) {
        common.query_count(properties, property_filter, user_id, res, common.return);
    });
});

router.get('/stats', passport.authenticate('bearer', { session: false }), function(req, res) {
    form_property_filter(common.get_payload(req,'filters'), String(req.user._id), res, function(property_filter, user_id, res) {
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
                    return res.json({status: 'OK', result: stats});
                });
            } else {
                return res.json({status: res.statusCode, error: JSON.stringify(err)});
            }
        });
    });
});

router.get('/results', passport.authenticate('bearer', { session: false }), function(req, res) {
    form_results_filter(common.get_payload(req,'filters'), String(req.user._id), res, function(results_filter, results_fields, user_id, res) {
        if (results_fields.length > 0) {
            common.query_fields_only(models, results_filter, results_fields, user_id, res, function(res, err, objs) {
                if (!err) {
                    common.get_gridfs_field_objs(objs, results_fields, res, common.return);
                } else {
                    return res.json({status: res.statusCode, error: JSON.stringify(err)});
                }
            });
        } else {
            common.query(models, results_filter, user_id, res, function(res, err, objs) {
                if (!err) {
                    common.get_gridfs_objs(objs, res, common.return);
                } else {
                    return res.json({status: res.statusCode, error: JSON.stringify(err)});
                }
            });
        }
    });
});

router.get('/results/count', passport.authenticate('bearer', { session: false }), function(req, res) {
    form_results_filter(common.get_payload(req,'filters'), String(req.user._id), res, function(results_filter, results_fields, user_id, res) {
        common.query_count(models, results_filter, user_id, res, common.return);
    });
});

module.exports = router;
