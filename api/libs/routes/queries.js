var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var models_routes = require(libs + 'routes/models');
//var collection = db.get().collection('properties');
//var ObjType = require(libs + 'schemas/property');
var GridStore = require('mongodb').GridStore;
var executables = db.get().collection('executables');
var models = db.get().collection('fs.files');
var properties = db.get().collection('properties');

//
// Submit
//

//
// Retrieve
//

function form_property_filter(filters, user_id, res, cb) {
    // Find executable
    common.query_fields_only(executables, filters['executable'], ['_id'], user_id, res, function(res, err, result) {
        if (!err) {
            var executable_id = String(result[0]['_id']);
            // Find models
            common.query_fields_only(models, filters['model'], ['_id'], user_id, res, function(res, err, result) {
                if (!err) {
                    var model_ids = [];
                    for (var i=0; i<result.length; i++) {
                        model_ids.push(String(result[i]['_id']));
                    }
                    // Form property filter
                    var property_filter = {'executable_id':executable_id,'input_model_id':{'$in':model_ids}};
                    for (var key in filters['params']) {
                        property_filter['params.'+key] = filters['params'][key];
                    }
                    cb(property_filter, user_id, res);

                } else {
                    return res.json({status: res.statusCode, error: JSON.stringify(err)});
                }
            });
        } else {
            return res.json({status: res.statusCode, error: JSON.stringify(err)});
        }
    });
}

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    form_property_filter(JSON.parse(req.query.filters), String(req.user._id), res, function(property_filter, user_id, res) {
        common.query(properties, property_filter, user_id, res, common.return);
    });
});

router.get('/count', passport.authenticate('bearer', { session: false }), function(req, res) {
    form_property_filter(JSON.parse(req.query.filters), String(req.user._id), res, function(property_filter, user_id, res) {
        common.query_count(properties, property_filter, user_id, res, common.return);
    });
});

router.get('/stats', passport.authenticate('bearer', { session: false }), function(req, res) {
    form_property_filter(JSON.parse(req.query.filters), String(req.user._id), res, function(property_filter, user_id, res) {
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

function concaternate(o1, o2) {
    for (var key in o2) {
        o1[key] = o2[key];
    }
    return o1;
}

router.get('/results', passport.authenticate('bearer', { session: false }), function(req, res) {
    form_property_filter(JSON.parse(req.query.filters), String(req.user._id), res, function(property_filter, user_id, res) {
        property_filter["status"] = "resolved";
        // Get output model ids
        common.query_fields_only(properties, property_filter, ['output_model_id'], user_id, res, function(res, err, result) {
            if(!err) {
                var model_ids = [];
                for (var i=0; i<result.length; i++) {
                    model_ids.push(result[i]['output_model_id']);
                }
                // Get models
                common.query(models, {"_id":{"$in":model_ids}}, user_id, res, function(res, err, objs) {
                    if(!err) {
                        var items = [];
                        var apply_content = function(i){
                            if (i<objs.length) {
                                var data = null;
                                var err = null;
                                GridStore.read(db.get(), String(objs[i]._id), function(err, fileData) {
                                    if(!err) {
                                        data = fileData.toString();
                                        items.push(concaternate({'content':JSON.parse(data),'_id':objs[i]._id}, objs[i].metadata));
                                        apply_content(i+1);
                                    } else {
                                        res.statusCode = 500;
                                        log.error('Internal error(%d): %s',res.statusCode,err.message);
                                        return res.json({ error: 'Server error' });
                                    }
                                });
                            } else {
                                log.info("Returning %d objects",items.length);
                                return res.json({ status: 'OK', result: items });
                            }
                        };
                        apply_content(0);
                    } else {
                        return res.json(err);
                    }
                });
            } else {
                return res.json(err);
            }
        });
    });
});

module.exports = router;
