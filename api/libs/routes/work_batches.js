var express = require('express');
var passport = require('passport');
var router = express.Router();
var co = require('co');
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var WorkBatches = require(libs + 'collections/work_batches');
var Models = require(libs + 'collections/models');
var Executables = require(libs + 'collections/executables');
var Properties = require(libs + 'collections/properties');

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
    common.return_promise(res, WorkBatches.commit(common.get_payload(req,'objs'), req.user));
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
    co(function *() {
        var results = common.get_payload(req, 'results');
        var good_models = [];
        var all_properties = [];
        for (var i=0; i<results.length; i++) {
            var property = results[i]['property'];
            if (property['status'] === 'resolved') {
                var model = results[i]['model'];
                var obj = yield Models.commit_one(model, req.user);
                property['output_model_id'] = obj['ids'][0];
                Properties.replace_one(property, req.user);
            } else {
                Properties.replace_one(property, req.user);
            }
        }
    });
    common.return(res, 0, 1);
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
    var filter = common.get_payload(req, 'filter');
    co(function *() {
        var work_batch = yield WorkBatches.pop(filter, {timestamp: 1}, req.user);
        if (work_batch) {
            var count = yield Properties.update({'_id':{'$in':work_batch['property_ids']}}, {'status':'running'}, req.user);
            var property_objs = yield Properties.query({'_id':{'$in':work_batch['property_ids']}}, [], req.user);
            var model_objs = yield Models.query({'_id':{'$in':work_batch['model_ids']}}, [], req.user);
            var executable_objs = yield Executables.query({'_id':{'$in':work_batch['executable_ids']}}, [], req.user);
            return {'properties': property_objs, 'models': model_objs, 'executables': executable_objs};
        } else {
            return {'properties': [], 'models': [], 'executables': []};
        }
    }).then(function(obj) {
        common.return(res, 0, obj);
    }).catch(function(err) {
        common.return(res, err, 0);
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
    common.return_promise(res, WorkBatches.count(common.get_payload(req,'filter'), req.user));
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
    common.return_promise(res, WorkBatches.delete(common.get_payload(req,'filter'), req.user));
});

module.exports = router;
