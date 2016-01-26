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

function shuffle_array(array) {
    for (var i=array.length-1; i>0; i--) {
        var j = Math.floor(Math.random() * (i+1));
        var tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
    return array;
}

var create_nested_object = function(obj, keys, value) {
    var lastName = arguments.length === 3 ? keys[keys.length-1] : false;
    for (var i=0; i<keys.length-1; i++) {
        obj = obj[keys[i]] = obj[keys[i]] || {};
    }
    if(lastName) {
        obj = obj[lastName] = value;
    }
    return obj;
};

function find_in_operators(ins, obj, keys) {
    for (var key in obj) {
        if (key === '$in') {
            ins.push({'keys':keys, 'values':obj[key]});
        } else {
            if (typeof obj[key] === 'object') {
                find_in_operators(ins, obj[key], keys.concat(key));
            }
        }
    }
}

function expand_props(props) {
    var new_props = [];
    for (var i=0; i<props.length; i++) {
        var prop = props[i];
        var ins = [];
        find_in_operators(ins, props[i], []);
        var branch_ins = function(i, ins, keys_vals) {
            if (i<ins.length) {
                for (var j=0; j<ins[i].values.length; j++) {
                    branch_ins(i+1, ins, keys_vals.concat({'keys':ins[i].keys, 'value':ins[i].values[j]}));
                }
            } else {
                var new_prop = JSON.parse(JSON.stringify(prop));
                for (var k=0; k<keys_vals.length; k++) {
                    create_nested_object(new_prop, keys_vals[k]['keys'], keys_vals[k]['value']);
                }
                new_props.push(new_prop);
            }
        };
        branch_ins(0, ins, []);
    }
    return new_props;
}

function set_defaults(filters, fields, settings, cb) {
    // Handle default
    var default_filter_keys = ['input_model','executable','params','output_model'];
    var i;
    for (i=0; i<default_filter_keys.length; i++) {
        if(!filters.hasOwnProperty(default_filter_keys[i])) {
            filters[default_filter_keys[i]] = {};
        }
    }
    var default_fields = ['input_model','executable','params','output_model'];
    for (i=0; i<default_fields.length; i++) {
        if(!fields.hasOwnProperty(default_fields[i])) {
            fields[default_fields[i]] = [];
        }
    }
    if (!settings['timeout']) {
        settings['timeout'] = 3600;
    }
    cb(filters, fields, settings);
}

function setup_query(filters, fields, settings, user_id, res, cb) {
    // Commit query
    var query = [{'filters': filters, 'fields': fields, 'settings':settings}];
    common.commit(ObjType, collection, query, user_id, res, function(res, err, query_ids) {
        if (!err) {
            var query_id = new ObjectID(query_ids[0]);
            // Query for query
            common.query(collection, {'_id': query_id}, ['_id','input_model_ids','executable','property_ids'], user_id, res, function(res, err, query_objs) {
                if (!err) {
                    // Get input model objects from filters
                    common.query(models, filters['input_model'], ['_id'].concat(fields['input_model']), user_id, res, function(res, err, input_model_objs) {
                        if (!err) {
                            var input_model_ids = [];
                            for (var i=0; i<input_model_objs.length; i++) {
                                input_model_ids.push(input_model_objs[i]['_id']);
                            }
                            // Get executable objects from filters
                            common.query(executables, filters['executable'], ['_id'].concat(fields['executable']), user_id, res, function(res, err, executable_objs) {
                                if (!err) {
                                    var executable_ids = [];
                                    for (var i=0; i<executable_objs.length; i++) {
                                        executable_ids.push(executable_objs[i]['_id']);
                                    }
                                    // If input models/executables have changed, remake properties, otherwise don't
                                    if ((input_model_ids === query_objs[0]['input_model_ids']) || (executable_ids === query_objs[0]['executable_ids'])) {
                                        // Get property info
                                        if (query_objs[0].hasOwnProperty('property_ids')) {
                                            var property_ids = query_objs[0]['property_ids'];
                                            var property_filter = {'_id':{'$in':property_ids}, 'status':'resolved'};
                                            var property_fields = ['_id','status','input_model_id','executable_id','output_model_id'];
                                            for (var i=0; i<fields['params'].length; i++) {
                                                property_fields.push('params.'+fields['params'][i]);
                                            }
                                            common.query(properties, property_filter, property_fields, user_id, res, function(res, err, property_objs) {
                                                if (!err) {
                                                    cb([query_objs[0]['_id']], input_model_objs, executable_objs, property_objs, res);
                                                } else {
                                                    common.return(res, err, 0);
                                                }
                                            });
                                        } else {
                                            cb([query_objs[0]['_id']], input_model_objs, executable_objs, [], res);
                                        }
                                    } else {
                                        // Form properties
                                        log.debug('form properties');
                                        var props = [];
                                        for (var i=0; i<input_model_ids.length; i++) {
                                            for (var j=0; j<executable_ids.length; j++) {
                                                var prop = {'executable_id':executable_ids[j],'input_model_id':input_model_ids[i],'timeout':settings['timeout'],'params':{}};
                                                for (var key in filters['params']) {
                                                    prop['params'][key] = filters['params'][key];
                                                }
                                                props.push(prop);
                                            }
                                        }
                                        props = expand_props(props);
                                        // FIXME: No need to randomize
                                        props = shuffle_array(props);
                                        // Commit properties
                                        common.commit(property, properties, props, user_id, res, function(res, err, property_ids) {
                                            if (!err) {
                                                // Check if there are any properties or not
                                                if (property_ids.length > 0) {
                                                    // Form property filter
                                                    var prop_ids = [];
                                                    for (var i=0; i<property_ids.length; i++) {
                                                        prop_ids.push(new ObjectID(property_ids[i]));
                                                    }
                                                    var property_filter = {'_id':{'$in':prop_ids},'status':'resolved'};
                                                    var property_fields = ['_id','status','input_model_id','executable_id','output_model_id'];
                                                    for (var j=0; i<fields['params'].length; j++) {
                                                        property_fields.push('params.'+fields['params'][j]);
                                                    }
                                                    // Get property objects
                                                    common.query(properties, property_filter, property_fields, user_id, res, function(res, err, property_objs) {
                                                        if (!err) {
                                                            // Update query
                                                            var update = {'input_model_ids': input_model_ids, 'executable_ids': executable_ids, 'property_ids': property_ids};
                                                            common.update(collection, {'_id': query_id}, update, user_id, res, function(res, err, n_modified) {
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
                                                    cb(query_ids, input_model_objs, executable_objs, [], res);
                                                }
                                            } else {
                                                common.return(res, err, 0);
                                            }
                                        });
                                    }
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

function get_status(filters, fields, user_id, res, cb) {
    var stats_obj = {'resolved':0, 'pulled':0, 'running':0, 'not found': 0, 'errored':0, 'timed out':0, 'unresolved':0, 'total': 0};
    var query = {};
    common.query(collection, query, ['property_ids'], user_id, res, function(res, err, query_objs) {
        if (!err) {
            if (query_objs.length > 0) {
                // Get stats
                var ids = query_objs[0]['property_ids'];
                properties.group(['status'],{'_id':{'$in':ids}},{'count':0},"function(obj,prev) { prev.count++; }", function (err, counts) {
                    for (var i=0; i<counts.length; i++) {
                        stats_obj[counts[i].status] += counts[i].count;
                        stats_obj['total'] += counts[i].count;
                    }
                    cb(res, 0, stats_obj);
                });
            } else {
                cb(res, 0, stats_obj);
            }
        } else {
            cb(res, err, 0);
        }
    });
}

//
// Submit/Retrieve
//

router.get('/submit', passport.authenticate('bearer', { session: false }), function(req, res) {
    // Get filters, fields, settings, and user id
    var filters = common.get_payload(req,'filters');
    var fields = common.get_payload(req,'fields');
    var settings = common.get_payload(req,'settings');

    var user_id = String(req.user._id);
    // Commit query, get input model objects, executable objects, and property objects
    set_defaults(filters, fields, settings, function(filters, fields, settings) {
        setup_query(filters, fields, settings, user_id, res, function(query_ids, input_model_objs, executable_objs, property_objs, res) {
            common.return(res, 0, property_objs);
        });
    });
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    // Get filters, fields, settings, and user id
    var filters = common.get_payload(req,'filters');
    var fields = common.get_payload(req,'fields');
    var settings = common.get_payload(req,'settings');
    var user_id = String(req.user._id);
    set_defaults(filters, fields, settings, function(filters, fields, settings) {
        // Commit query, get input model objects, executable objects, and commit properties
        setup_query(filters, fields, settings, user_id, res, function(query_ids, input_model_objs, executable_objs, property_objs, res) {
            // Get output model info
            var output_model_ids = [];
            for (var i=0; i<property_objs.length; i++) {
                if (property_objs[i]['output_model_id'] !== '') {
                    output_model_ids.push(new ObjectID(property_objs[i]['output_model_id']));
                }
            }
            filters['output_model']['_id'] = {'$in': output_model_ids};
            common.query(models, filters['output_model'], ['_id'].concat(fields['output_model']), user_id, res, function(res, err, output_model_objs) {
                if (!err) {
                    common.get_gridfs_objs(output_model_objs, ['_id'].concat(fields['output_model']), res, function(res, err, output_model_objs) {
                        log.debug('sorting');
                        if (!err) {
                            // Sort everything
                            var input_model_indexes = {};
                            for (var i=0; i<input_model_objs.length; i++) {
                                input_model_indexes[String(input_model_objs[i]['_id'])] = i;
                            }
                            var output_model_indexes = {};
                            for (var i=0; i<output_model_objs.length; i++) {
                                output_model_indexes[String(output_model_objs[i]['_id'])] = i;
                            }
                            var executable_indexes = {};
                            for (var i=0; i<executable_objs.length; i++) {
                                executable_indexes[String(executable_objs[i]['_id'])] = i;
                            }
                            var objs = [];
                            for (var i=0; i<property_objs.length; i++) {
                                var obj = {'input_model': input_model_objs[input_model_indexes[property_objs[i]['input_model_id']]],
                                           'executable': executable_objs[executable_indexes[property_objs[i]['executable_id']]],
                                           'params': property_objs[i]['params'],
                                           'status': property_objs[i]['status']};
                                if (property_objs[i]['status'] === 'resolved') {
                                    obj['output_model'] = output_model_objs[output_model_indexes[property_objs[i]['output_model_id']]];
                                } else {
                                    obj['output_model'] = '';
                                }
                                objs.push(obj);
                            }
                            // Return
                            log.debug('returning');
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

router.get('/status', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filters = common.get_payload(req,'filters');
    var fields = common.get_payload(req,'fields');
    var user_id = String(req.user._id);
    set_defaults(filters, fields, {}, function(filters, fields, settings) {
        get_status(filters, fields, user_id, res, common.return);
    });
});

router.get('/status/all', passport.authenticate('bearer', { session: false }), function(req, res) {
    var user_id = String(req.user._id);
    common.query(collection, {}, [], user_id, res, function(res, err, queries) {
        if (!err) {
            var stats_objs = [];
            var append_stats = function(count) {
                if (count<queries.length) {
                    var filters = JSON.parse(queries[count]['filters']);
                    var fields = queries[count]['fields'];
                    get_status(filters, fields, user_id, res, function(res, err, stats_obj) {
                        stats_obj['timestamp'] = queries[count]['timestamp'];
                        stats_obj['_id'] = queries[count]['_id'];
                        stats_objs.push(stats_obj);
                        append_stats(count+1);
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
