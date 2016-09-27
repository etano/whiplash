var express = require('express');
var passport = require('passport');
var router = express.Router();
var co = require('co');
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var ObjectID = require('mongodb').ObjectID;
var Queries = require(libs + 'collections/queries');
var Executables = require(libs + 'collections/executables');
var Models = require(libs + 'collections/models');
var Properties = require(libs + 'collections/properties');

function shuffle_array(array) {
    global.timer.get_timer('shuffle_array').start();
    for (var i=array.length-1; i>0; i--) {
        var j = Math.floor(Math.random() * (i+1));
        var tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
    global.timer.get_timer('shuffle_array').stop();
    return array;
}

var create_nested_object = function(obj, keys, value) {
    global.timer.get_timer('create_nested_object').start();
    var lastName = arguments.length === 3 ? keys[keys.length-1] : false;
    for (var i=0; i<keys.length-1; i++) {
        obj = obj[keys[i]] = obj[keys[i]] || {};
    }
    if(lastName) {
        obj = obj[lastName] = value;
    }
    global.timer.get_timer('create_nested_object').stop();
    return obj;
};

function find_in_operators(ins, obj, keys, rec) {
    if (!rec) {
        global.timer.get_timer('find_in_operators').start();
    }
    for (var key in obj) {
        if (key === '$in') {
            ins.push({'keys':keys, 'values':obj[key]});
        } else {
            if (typeof obj[key] === 'object') {
                find_in_operators(ins, obj[key], keys.concat(key), true);
            }
        }
    }
    if (!rec) {
        global.timer.get_timer('find_in_operators').stop();
    }
}

function expand_props(props) {
    global.timer.get_timer('expand_props').start();
    log.debug('expand props');
    var new_props = [];
    for (var i=0; i<props.length; i++) {
        var ins = [];
        find_in_operators(ins, props[i], []);
        if (ins.length>0) {
            var prop = props[i];
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
        } else {
            new_props.push(props[i]);
        }
    }
    log.debug('expanded from %d to %d properties', props.length, new_props.length);
    global.timer.get_timer('expand_props').stop();
    return new_props;
}

function set_defaults(filters, fields, settings) {
    global.timer.get_timer('set_defaults').start();
    // Handle default
    return new Promise(function(resolve, reject) {
        try {
            var default_filter_keys = ['input_model', 'executable', 'params', 'output_model'];
            var i;
            for (i=0; i<default_filter_keys.length; i++) {
                if(!filters.hasOwnProperty(default_filter_keys[i])) {
                    filters[default_filter_keys[i]] = {};
                }
            }
            var default_fields = ['input_model', 'executable', 'params', 'output_model'];
            for (i=0; i<default_fields.length; i++) {
                if(!fields.hasOwnProperty(default_fields[i])) {
                    fields[default_fields[i]] = [];
                }
            }
            if (!settings.timeout) {
                settings.timeout = 3600;
            }
            if (!settings.get_logs) {
                settings.get_logs = false;
            }
            global.timer.get_timer('set_defaults').stop();
            resolve({
                filters: filters,
                fields: fields,
                settings: settings
            });
        } catch(err) {
            log.error(err);
            reject(err);
        }
    });
}

function setup_query(filters, fields, settings, user) {
    global.timer.get_timer('setup_query').start();
    return new Promise(function(resolve, reject) {
        co(function *() {
            // Commit query
            var query = {'filters': common.smart_stringify(filters), 'fields': fields, 'settings': settings};
            var result = yield Queries.commit_one(query, user);
            var query_id = result.ids[0];

            // Get input model objects from filters
            var input_model_objs = yield Models.query(filters['input_model'], ['_id'].concat(fields['input_model']), user);
            var input_model_ids = [];
            for (var i=0; i<input_model_objs.length; i++) {
                input_model_ids.push(input_model_objs[i]['_id']);
            }

            // Get executable objects from filters
            var executable_objs = yield Executables.query(filters['executable'], ['_id'].concat(fields['executable']), user);
            var executable_ids = [];
            for (var i=0; i<executable_objs.length; i++) {
                executable_ids.push(executable_objs[i]['_id']);
            }

            var property_stats = {};
            var property_filter = {
                executable_id: {$in: executable_ids},
                input_model_id: {$in: input_model_ids},
            };
            for (var key in filters['params']) {
                property_filter['params.'+key] = filters['params'][key];
            }

            if (settings.submit_new) {
                // Form properties
                log.debug('form properties');
                global.timer.get_timer('form_properties').start();
                var props = [];
                for (var i=0; i<input_model_ids.length; i++) {
                    for (var j=0; j<executable_ids.length; j++) {
                        var prop = {
                            'input_model_id': input_model_ids[i],
                            'executable_id': executable_ids[j],
                            'params': {},
                            'status': 'unresolved',
                            'timestamp': Date.now,
                            'owner': user._id
                        };
                        if (settings.timeout)
                            prop.timeout = settings.timeout;
                        for (var key in filters['params']) {
                            prop['params'][key] = filters['params'][key];
                        }
                        props.push(prop);
                    }
                }
                global.timer.get_timer('form_properties').stop();
                props = expand_props(props);

                // Commit properties
                result = yield Properties.commit(props, user);
                property_stats = {
                    n_existing: result["n_existing"],
                    n_new: result["n_new"],
                    commit_tag: result["commit_tag"]
                };

            } else {
                // Update properties
                var commit_tag = new ObjectID();
                var update = {commit_tag: commit_tag};
                var updated_count = yield Properties.update(property_filter, update, user);
                property_stats = {
                    n_existing: updated_count,
                    n_new: 0,
                    commit_tag: commit_tag
                };
            }

            return {
                query_id: query_id,
                input_model_objs: input_model_objs,
                executable_objs: executable_objs,
                property_stats: property_stats,
                property_filter: property_filter
            };
        }).then(function(obj) {
            global.timer.get_timer('setup_query').stop();
            resolve(obj);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('setup_query').stop();
            reject(err);
        });
    });
}

/**
 * @api {get} /queries/status Status
 * @apiGroup Queries
 * @apiName Status
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParam {Object} filters Query filters.
 * @apiParam {Object} filters.input_model Query filter for input model.
 * @apiParam {Object} filters.executable Query filter for executable.
 * @apiParam {Object} filters.params Query filter for running parameters.
 * @apiParam {Object} filters.output_model Query filter for output model.
 * @apiParam {Object} fields Return fields.
 * @apiParam {Object} fields.input_model Return fields for input model.
 * @apiParam {Object} fields.executable Return fields for executable.
 * @apiParam {Object} fields.params Return fields for running parameters.
 * @apiParam {Object} fields.output_model Return fields for output model.
 * @apiParam {Object} settings Various extra settings.
 * @apiParam {Number} timeout Maximum time allowed per property resolution.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       filters = {
 *           "input_model": {"name": "example0"},
 *           "executable": {"name": "example0"},
 *           "params": {
 *               "sleep_time": 1.0,
 *               "seed": {"$in": [0,1]}
 *           },
 *           "output_model": {}
 *       },
 *       fields = {
 *           "input_model": ["name"],
 *           "executable": ["name"],
 *           "params": ["sleep_time"],
 *           "output_model": ["number"]
 *       }
 *     }
 *
 * @apiSuccess {Object} result Status object.
 * @apiSuccess {Number} result.resolved Number of resolved properties resulting from query.
 * @apiSuccess {Number} result.unresolved Number of unresolved properties resulting from query.
 * @apiSuccess {Number} result.pulled Number of queued properties resulting from query.
 * @apiSuccess {Number} result.running Number of running properties resulting from query.
 * @apiSuccess {Number} result.notfound Number of not found properties resulting from query.
 * @apiSuccess {Number} result.errored Number of errored properties resulting from query.
 * @apiSuccess {Number} result.timedout out Number of timed out properties resulting from query.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": {
 *         "resolved": 2,
 *         "pulled": 0,
 *         "running": 0,
 *         "not found": 0,
 *         "errored": 0,
 *         "timed out": 0,
 *         "unresolved": 0,
 *         "total": 0
 *       }
 *     }
 *
 */
router.get('/status', passport.authenticate('bearer', { session: false }), function(req, res) {
    global.timer.get_timer('get_status').start();
    var stats_obj = {
        resolved: 0,
        pulled: 0,
        running: 0,
        'not found': 0,
        errored: 0,
        'timed out': 0,
        unresolved: 0,
        total: 0
    };
    co(function *() {
        // Get filters, fields, settings, and user id
        var filters = common.get_payload(req,'filters');

        // Set defaults
        var settings = {submit_new: false};
        var fields = {
            input_model: ["_id"],
            executable: ["_id"],
            params: [],
            output_model: []
        };
        var defaults = yield set_defaults(filters, fields, settings);
        filters = defaults.filters;
        fields = defaults.fields;
        settings = defaults.settings;

        // Get property objects
        var query = yield setup_query(filters, fields, settings, req.user);
        var property_objs = [];
        var property_filter = query.property_filter;
        var property_fields = ['status', 'walltime'];
        var property_objs = yield Properties.query(property_filter, property_fields, req.user);

        // Get stats
        log.debug('organizing statuses');
        for (var i=0; i<property_objs.length; i++) {
            stats_obj[property_objs[i]['status']]++;
        }
        stats_obj['total'] = property_objs.length;
        global.timer.get_timer('get_status').stop();
        common.return(res, 0, stats_obj);
    }).catch(function(err) {
        log.error(err);
        global.timer.get_timer('get_status').stop();
        common.return(res, err, stats_obj);
    });
});

/**
 * @api {get} /queries Query
 * @apiGroup Queries
 * @apiName Query
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParam {Object} filters Query filters.
 * @apiParam {Object} filters.input_model Query filter for input model.
 * @apiParam {Object} filters.executable Query filter for executable.
 * @apiParam {Object} filters.params Query filter for running parameters.
 * @apiParam {Object} filters.output_model Query filter for output model.
 * @apiParam {Object} fields Return fields.
 * @apiParam {Object} fields.input_model Return fields for input model.
 * @apiParam {Object} fields.executable Return fields for executable.
 * @apiParam {Object} fields.params Return fields for running parameters.
 * @apiParam {Object} fields.output_model Return fields for output model.
 * @apiParam {Object} settings Various extra settings.
 * @apiParam {Number} timeout Maximum time allowed per property resolution.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       filters = {
 *           "input_model": {"name": "example0"},
 *           "executable": {"name": "example0"},
 *           "params": {
 *               "sleep_time": 1.0,
 *               "seed": {"$in": [0,1]}
 *           },
 *           "output_model": {}
 *       },
 *       fields = {
 *           "input_model": ["name"],
 *           "executable": ["name"],
 *           "params": ["sleep_time"],
 *           "output_model": ["number"]
 *       },
 *       settings = {
 *           "timeout": 300,
 *           "get_logs": false
 *       }
 *     }
 *
 * @apiSuccess {Object} result Result obj.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": [
 *         {
 *           "input_model": {"name": "example0"},
 *           "executable": {"name": "example0"},
 *           "params": {"sleep_time": 1.0},
 *           "output_model": {"number": 0},
 *           "status": "resolved",
 *           "walltime": 1.21
 *         },
 *         {
 *           "input_model": {"name": "example0"},
 *           "executable": {"name": "example0"},
 *           "params": {"sleep_time": 1.0},
 *           "output_model": {"number": 1},
 *           "status": "resolved",
 *           "walltime": 1.23
 *         },
 *       ]
 *     }
 *
 */
router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    global.timer.get_timer('query').start();
    co(function *() {
        // Get filters, fields, settings, and user id
        var filters = common.get_payload(req,'filters');
        var fields = common.get_payload(req,'fields');
        var settings = common.get_payload(req,'settings');

        // Set defaults
        settings.submit_new = false;
        var defaults = yield set_defaults(filters, fields, settings);
        filters = defaults.filters;
        fields = defaults.fields;
        settings = defaults.settings;

        // Commit query, get input model objects, executable objects, and commit properties
        var query = yield setup_query(filters, fields, settings, req.user);

        // Get property objects
        var property_objs = [];
        var property_filter = query.property_filter;
        var property_fields = ['_id', 'status', 'walltime', 'input_model_id', 'executable_id', 'output_model_id'];
        for (var j=0; j<fields.params.length; j++) {
            property_fields.push('params.'+fields.params[j]);
        }
        if (settings.get_logs) {
            property_fields.push('log');
            property_fields.push('err');
        }
        var property_objs = yield Properties.query(property_filter, property_fields, req.user);

        // Get output model info
        var output_model_ids = [];
        for (var i=0; i<property_objs.length; i++) {
            if (property_objs[i].hasOwnProperty('output_model_id')) {
                output_model_ids.push(property_objs[i].output_model_id);
            }
        }
        filters.output_model._id = {$in: output_model_ids};
        var output_model_objs = yield Models.query(filters.output_model, ['_id'].concat(fields.output_model), req.user);

        // Sort everything
        log.debug('sorting');
        var input_model_indexes = {};
        for (var i=0; i<query.input_model_objs.length; i++) {
            input_model_indexes[String(query.input_model_objs[i]._id)] = i;
        }
        var output_model_indexes = {};
        for (var i=0; i<output_model_objs.length; i++) {
            output_model_indexes[String(output_model_objs[i]._id)] = i;
        }
        var executable_indexes = {};
        for (var i=0; i<query.executable_objs.length; i++) {
            executable_indexes[String(query.executable_objs[i]._id)] = i;
        }
        var objs = [];
        for (var i=0; i<property_objs.length; i++) {
            var obj = {
                input_model: query.input_model_objs[input_model_indexes[property_objs[i].input_model_id]],
                executable: query.executable_objs[executable_indexes[property_objs[i].executable_id]],
                params: property_objs[i].params,
                status: property_objs[i].status
            };
            if (obj.status === 'resolved') {
                obj.output_model = output_model_objs[output_model_indexes[property_objs[i].output_model_id]];
                obj.walltime = property_objs[i].walltime;
            } else {
                obj.output_model = '';
            }
            if (settings.get_logs) {
                obj.log = property_objs[i].log;
                obj.err = property_objs[i].err;
            }
            objs.push(obj);
        }

        // Return
        log.debug('returning');
        return objs;
    }).then(function(objs) {
        global.timer.get_timer('query').stop();
        common.return(res, 0, objs);
    }).catch(function(err) {
        log.error(err);
        global.timer.get_timer('query').stop();
        common.return(res, err, 0);
    });
});

/**
 * @api {post} /queries Submit
 * @apiGroup Queries
 * @apiName Submit
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParam {Object} filters Query filters.
 * @apiParam {Object} filters.input_model Query filter for input model.
 * @apiParam {Object} filters.executable Query filter for executable.
 * @apiParam {Object} filters.params Query filter for running parameters.
 * @apiParam {Object} filters.output_model Query filter for output model.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       filters = {
 *           "input_model": {"name": "example0"},
 *           "executable": {"name": "example0"},
 *           "params": {
 *               "sleep_time": 1.0,
 *               "seed": {"$in": [0,1]}
 *           },
 *           "output_model": {}
 *       }
 *     }
 *
 * @apiSuccess {Object} result Result object from submission.
 * @apiSuccess {Number} result.resolved Number of resolved properties resulting from query.
 * @apiSuccess {Number} result.unresolved Number of unresolved properties resulting from query.
 * @apiSuccess {Number} result.pulled Number of queued properties resulting from query.
 * @apiSuccess {Number} result.running Number of running properties resulting from query.
 * @apiSuccess {Number} result.notfound Number of not found properties resulting from query.
 * @apiSuccess {Number} result.errored Number of errored properties resulting from query.
 * @apiSuccess {Number} result.timedout out Number of timed out properties resulting from query.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": {
 *         "resolved": 2,
 *         "pulled": 0,
 *         "running": 0,
 *         "not found": 0,
 *         "errored": 0,
 *         "timed out": 0,
 *         "unresolved": 0,
 *         "total": 0
 *       }
 *     }
 *
 */
router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    global.timer.get_timer('submit').start();
    var stats_obj = {
        resolved: 0,
        pulled: 0,
        running: 0,
        'not found': 0,
        errored: 0,
        'timed out': 0,
        unresolved: 0,
        total: 0
    };
    co(function *() {
        // Get filters and settings
        var filters = common.get_payload(req, 'filters');
        var settings = common.get_payload(req, 'settings');

        // Set defaults
        settings['submit_new'] = true;
        var fields = {
            input_model: ["_id"],
            executable: ["_id"],
            params: [],
            output_model: []
        };
        var defaults = yield set_defaults(filters, fields, settings);
        filters = defaults.filters;
        fields = defaults.fields;
        settings = defaults.settings;

        // Get property objects
        var query = yield setup_query(filters, fields, settings, req.user);
        var property_objs = [];
        var property_filter = query.property_filter;
        var property_fields = ['status', 'walltime'];
        var property_objs = yield Properties.query(property_filter, property_fields, req.user);

        // Get stats
        log.debug('organizing statuses');
        for (var i=0; i<property_objs.length; i++) {
            stats_obj[property_objs[i]['status']]++;
        }
        stats_obj['total'] = property_objs.length;
        global.timer.get_timer('submit').stop();
        common.return(res, 0, stats_obj);
    }).catch(function(err) {
        log.error(err);
        global.timer.get_timer('submit').stop();
        common.return(res, err, stats_obj);
    });

});


/**
 * @api {delete} /queries Delete
 * @apiGroup Queries
 * @apiUse Delete
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "owner": "lkfa309jf1"
 *       }
 *     }
 */
router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Queries.delete(common.get_payload(req,'filter'), req.user));
});

/**
 * @api {get} /queries/count Count
 * @apiGroup Queries
 * @apiUse Delete
 * @apiPermission user
 * @apiVersion 1.0.0
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "owner": "lkfa309jf1"
 *       }
 *     }
 */
router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Queries.count(common.get_payload(req,'filter'), req.user));
});

module.exports = router;
