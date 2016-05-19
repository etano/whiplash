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

/**
 * @api {post} /work_batches Commit
 * @apiGroup WorkBatches
 * @apiUse Commit
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParam {String[]} objs.property_ids List of property IDs in work batch.
 * @apiParam {String[]} objs.model_ids List of model IDs in work batch.
 * @apiParam {String[]} objs.executable_ids List of executable IDs in work batch.
 * @apiParam {Number} total_time Sum of all property timeouts in seconds.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "objs": [
 *         {
 *           "property_ids": ["fon0i1f01f3", "lalajg-g30fl"],
 *           "model_ids": ["f10fj09330", "f01h3f01j30"],
 *           "executable_ids": ["0fj10fh903"],
 *           "total_time": 1000
 *         },
 *         {
 *           "property_ids": ["2g0j4gija0yj", "fi30fFEJ0ij"],
 *           "model_ids": ["f10fj09330", "f01h3f01j30"],
 *           "executable_ids": ["0fj10fh903"],
 *           "total_time": 1000
 *         }
 *       ]
 *     }
 */
router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(collection, common.get_payload(req,'objs'), String(req.user._id), res, common.return);
});

/**
 * @api {post} /work_batches CommitResolved
 * @apiGroup WorkBatches
 * @apiName CommitResolved
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParam {Object[]} results List of pairs of resolved properties and output models.
 * @apiParam {Object} results.property Resolved property.
 * @apiParam {Object} results.model Output model.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "results": [
 *         {
 *           "property": {
 *             "_id": "2g0j4gija0yj",
 *             "input_model_id": "f10fj09330",
 *             "executable_id": "0fj10fh903",
 *             "timeout": 500,
 *             "status": "resolved",
 *             "params": {
 *               "myParam": 10
 *             }
 *           },
 *           "model": {
 *             "property_id": "2g0j4gija0yj",
 *             "result": "good",
 *             "content": {
 *                "big": "result"
 *             }
 *           }
 *         }
 *       ]
 *     }
 *
 * @apiSuccess {Number} result Number of modified properties.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": 1
 *     }
 *
 */
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

/**
 * @api {get} /work_batches Pop
 * @apiGroup WorkBatches
 * @apiName Pop
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParam {Object} filter Filter for querying work batches.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "total_time": {
 *           "$lt": 1000
 *         }
 *       }
 *     }
 *
 * @apiSuccess {Object} result Object containing all the properties, models, and executables of the work batch.
 * @apiSuccess {Object[]} result.properties List of properties in work batch.
 * @apiSuccess {Object[]} result.models List of models in work batch.
 * @apiSuccess {Object[]} result.executables List of executables in work batch.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": {
 *         "properties": [
 *           {
 *             "_id": "2g0j4gija0yj",
 *             "input_model_id": "f10fj09330",
 *             "executable_id": "0fj10fh903",
 *             "timeout": 500,
 *             "status": "pulled",
 *             "params": {
 *               "myParam": 10
 *             }
 *           },
 *         ],
 *         "models": [
 *           {
 *             "_id": "f10fj09330",
 *             "my": "customfield",
 *             "content": {
 *                "big": "field"
 *             }
 *           }
 *         ],
 *         "executables": [
 *           {
 *             "_id": "0fj10fh903",
 *             "name": "udyn",
 *             "algorithm": "SQA-UE",
 *             "version": "1.1",
 *             "build": "O3",
 *             "path": "/users/ebrown/src/udyn/udyn",
 *             "description": "real-time evolution with RungeKutta",
 *             "params": {
 *                 "required": ["integrator_type", "integrator_tolerance", "integrator_dt", "Ttot", "schedule"],
 *                 "optional": ["iter_lanczos", "do_lanczos_ortho"]
 *             }
 *             "timestamp": 1463603877331,
 *           }
 *         ]
 *       }
 *     }
 *
 */
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

/**
 * @api {get} /work_batches/count Count
 * @apiGroup WorkBatches
 * @apiUse Count
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "total_time": {
 *           "$lt": 1000
 *         }
 *       }
 *     }
 */
router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.count(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

/**
 * @api {delete} /work_batches Delete
 * @apiGroup WorkBatches
 * @apiUse Delete
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "total_time": {
 *           "$lt": 1000
 *         }
 *       }
 *     }
 */
router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

module.exports = router;
