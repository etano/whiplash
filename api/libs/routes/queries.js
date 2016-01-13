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
var collection = db.get().collection('queries');
var ObjType = require(libs + 'schemas/query');
var ObjectID = require('mongodb').ObjectID;
var executables = db.get().collection('executables');
var models = db.get().collection('fs.files');
var properties = db.get().collection('properties');

//
// Helper functions
//

function setup_query(filters, fields, n_rep, user_id, res, cb) {
    // Commit query
    var query = [{'filters':filters,'fields':fields}];
    common.commit(ObjType, collection, query, user_id, res, function(res, err, query_ids) {
        if (!err) {
            // Get input model info
            common.query(models, filters['input_model'], ['_id'].concat(fields['input_model']), user_id, res, function(res, err, input_model_objs) {
                if (!err) {
                    // Get executable info
                    common.query(executables, filters['executable'], ['_id'].concat(fields['executable']), user_id, res, function(res, err, executable_objs) {
                        if (!err) {
                            // Form properties
                            var props = [];
                            for (var i=0; i<input_model_objs.length; i++) {
                                for (var j=0; j<executable_objs.length; j++) {
                                    for (var k=0; k<n_rep; k++) {
                                        var prop = {'executable_id':executable_objs[j]['_id'],'input_model_id':input_model_objs[i]['_id'],'timeout':3600,'params':{}}; // FIXME: Hard-coded timeout
                                        for (var key in filters['params']) {
                                            prop['params'][key] = filters['params'][key];
                                        }
                                        prop['params']['seed'] = k;
                                        props.push(prop);
                                    }
                                }
                            }
                            // Commit properties
                            common.commit(property, properties, props, user_id, res, function(res, err, property_ids) {
                                if (!err) {
                                    // Get property info
                                    var property_filter = {'_id':{'$in':property_ids}};
                                    var property_fields = ['_id','status','input_model_id','executable_id','output_model_id'];
                                    for (var i=0; i<fields['params'].length; i++) {
                                        property_fields.push('params.'+fields['params'][i]);
                                    }
                                    common.query(properties, property_filter, property_fields, user_id, res, function(res, err, property_objs) {
                                        if (!err) {
                                            cb(query_ids, input_model_objs, executable_objs, property_objs, res);
                                        } else {
                                            common.return(res, err, 0);
                                        }
                                    });
                                } else {
                                    common.return(res, err, 0);
                                }
                            });
                        } else {
                            common.return(res, err, 0);
                        }
                    });
                } else {
                    common.return(res, err, 0);
                }
            });
        } else {
            common.return(res, err, 0);
        }
    });
}

//
// Submit/Retrieve
//

router.get('/submit', passport.authenticate('bearer', { session: false }), function(req, res) {
    // Get filters, fields, n_reps, and user id
    var filters = common.get_payload(req,'filters');
    var fields = common.get_payload(req,'fields');
    var n_rep = common.get_payload(req,'n_rep');
    var user_id = String(req.user._id);
    log.debug(JSON.stringify(filters));
    log.debug(JSON.stringify(fields));
    // Commit query, get input model objects, executable objects, and property objects
    setup_query(filters, fields, n_rep, user_id, res, function(query_ids, input_model_objs, executable_objs, property_objs, res) {
        common.return(res, 0, property_objs);
    });
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    // Get filters, fields, n_reps, and user id
    var filters = common.get_payload(req,'filters');
    var fields = common.get_payload(req,'fields');
    var n_rep = common.get_payload(req,'n_rep');
    var user_id = String(req.user._id);
    // Commit query, get input model objects, executable objects, and commit properties
    setup_query(filters, fields, n_rep, user_id, res, function(query_ids, input_model_objs, executable_objs, property_objs, res) {
        // Get output model info
        var output_model_ids = [];
        for (var i=0; i<property_objs.length; i++) {
            if (property_objs[i]['output_model_id'] !== '') {
                output_model_ids.push(property_objs[i]['output_model_id']);
            }
        }
        filters['output_model']['_id'] = {'$in':output_model_ids};
        common.query(models, filters['output_model'], ['_id'].concat(fields['output_model']), user_id, res, function(res, err, output_model_objs) {
            if (!err) {
                common.get_gridfs_objs(output_model_objs, ['_id'].concat(fields['output_model']), res, function(res, err, output_model_objs) {
                    if (!err) {
                        // Sort everything
                        var i;
                        var input_model_indexes = {};
                        for (i=0; i<input_model_objs.length; i++) {
                            input_model_indexes[input_model_objs['_id']] = i;
                        }
                        var output_model_indexes = {};
                        for (i=0; i<output_model_objs.length; i++) {
                            output_model_indexes[output_model_objs['_id']] = i;
                        }
                        var executable_indexes = {};
                        for (i=0; i<executable_objs.length; i++) {
                            executable_indexes[executable_objs['_id']] = i;
                        }
                        var objs = [];
                        for (i=0; i<property_objs.length; i++) {
                            var obj = {'input_model': input_model_objs[input_model_indexes[property_objs['input_model_id']]],
                                       'executable': executable_objs[executable_indexes[property_objs['executable_id']]],
                                       'params': property_objs[i]['params']};
                            if (property_objs[i]['status'] === 'resolved') {
                                obj['output_model'] = output_model_objs[output_model_indexes[property_objs['output_model']]];
                            } else {
                                obj['output_model'] = '';
                            }
                            objs.push(obj);
                        }
                        // Return
                        common.return(res, err, objs);
                    } else {
                        common.return(res, err, 0);
                    }
                });
            } else {
                common.return(res, err, 0);
            }
        });
    });
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.count(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

//
// Delete
//

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

//
// Stats
//

router.get('/stats', passport.authenticate('bearer', { session: false }), function(req, res) {
    var user_id = String(req.user._id);
    // Get all queries
    common.query(collection, {}, [], user_id, res, function(res, err, queries) {
        if (!err) {
            var stats_objs = [];
            var append_stats = function(count) {
                if (count<queries.length) {
                    var filters = queries[count]['filters'];
                    var fields = queries[count]['fields'];
                    log.debug(JSON.stringify(filters));
                    log.debug(JSON.stringify(fields));
                    stats_objs.push({'timestamp':queries[count]['timestamp'], '_id':queries[count]['_id'], 'resolved':0, 'pulled':0, 'running':0, 'errored':0, 'timed out':0, 'unresolved':0, 'total': 0});
                    // Get input model info
                    common.query(models, filters['input_model'], ['_id'], user_id, res, function(res, err, input_model_objs) {
                        if (!err) {
                            // Get executable info
                            common.query(executables, filters['executable'], ['_id'], user_id, res, function(res, err, executable_objs) {
                                if (!err) {
                                    // Form property filter
                                    var i;
                                    var input_model_ids = [];
                                    for (i=0; i<input_model_objs.length; i++) {
                                        input_model_ids.push(input_model_objs[i]['_id']);
                                    }
                                    var executable_ids = [];
                                    for (i=0; i<executable_objs.length; i++) {
                                        executable_ids.push(executable_objs[i]['_id']);
                                    }
                                    var property_filter = {"input_model_id":{"$in":input_model_ids},"executable_id":{"$in":executable_ids}};
                                    // Get stats
                                    common.query(properties, property_filter, ['_id'], user_id, res, function(res, err, result) {
                                        if (!err) {
                                            var ids = [];
                                            for (var i=0; i<result.length; i++) {
                                                ids.push(result[i]['_id']);
                                            }
                                            properties.group(['status'],{'_id':{'$in':ids}},{'count':0},"function(obj,prev) { prev.count++; }", function (err, counts) {
                                                for (var i=0; i<counts.length; i++) {
                                                    stats_objs[count][counts[i].status] += counts[i].count;
                                                    stats_objs[count]['total'] += counts[i].count;
                                                }
                                                append_stats(count+1);
                                            });
                                        } else {
                                            common.return(res, err, 0);
                                        }
                                    });
                                } else {
                                    common.return(res, err, 0);
                                }
                            });
                        } else {
                            common.return(res, err, 0);
                        }
                    });
                } else {
                    common.return(res, 0, stats_objs);
                }
            };
            append_stats(0);
        } else {
            common.return(res, err, 0);
        }
    });
});

module.exports = router;
