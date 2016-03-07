var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('work_batches');
var models = db.get().collection('models');
var executables = db.get().collection('executables');
var properties = db.get().collection('properties');
var ObjType = require(libs + 'schemas/work_batch');

//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(collection, common.get_payload(req,'objs'), String(req.user._id), res, common.return);
});

//
// Resolved
//

router.post('/resolved', passport.authenticate('bearer', { session: false }), function(req, res) {
    var results = common.get_payload(req, 'results');
    var good_models = [];
    var all_properties = [];
    for (var i=0; i<results.length; i++) {
        if (results[i]['property']['status'] === 'resolved') {
            good_models.push(results[i]['model']);
            results[i]['property']['output_model_id'] = common.hash(results[i]['model']);
            all_properties.push(results[i]['property']);
        } else {
            all_properties.push(results[i]['property']);
        }
    }
    var user_id = String(req.user._id);
    common.commit(models, good_models, user_id, res, function(res, err, objs) {
        common.replace(properties, all_properties, user_id, res, common.return);
    });
});

//
// Query
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var user_id = String(req.user._id);
    var filter = common.get_payload(req, 'filter');
    common.pop(collection, filter, {timestamp: 1}, user_id, res, function (res, err, work_batch) {
        if (!err) {
            if (work_batch) {
                common.update(properties, {'_id':{'$in':work_batch['property_ids']}}, {'status':'running'}, user_id, res, function(res, err, count) {
                    if (!err) {
                        common.query(properties, {'_id':{'$in':work_batch['property_ids']}}, [], user_id, res, function(res, err, property_objs) {
                            if (!err) {
                                common.query(models, {'_id':{'$in':work_batch['model_ids']}}, [], user_id, res, function(res, err, model_objs) {
                                    if (!err) {
                                        common.query(executables, {'_id':{'$in':work_batch['executable_ids']}}, [], user_id, res, function(res, err, executable_objs) {
                                            if (!err) {
                                                common.return(res, 0, {'properties':property_objs, 'models':model_objs, 'executables':executable_objs});
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
                common.return(res, 0, {'properties':[], 'models':[], 'executables':[]});
            }
        } else {
            common.return(res, err, 0);
        }
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

module.exports = router;
