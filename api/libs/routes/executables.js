var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('executables');

/**
 * @api {post} /executables Commit
 * @apiGroup Executables
 * @apiUse Commit
 * @apiPermission user
 *
 * @apiParam {String} objs.name Name of executable.
 * @apiParam {String} objs.path Path to executable or url of Docker container.
 * @apiParam {Object} objs.params Necessary parameters.
 * @apiParamExample {json} Request-Example:
 *     {
 *       "objs": [
 *         {
 *           "name": "udyn",
 *           "algorithm": "SQA-UE",
 *           "version": "1.1",
 *           "build": "O3",
 *           "path": "/users/ebrown/src/udyn/udyn",
 *           "description": "real-time evolution with RungeKutta",
 *           "params": {
 *               "required": ["integrator_type", "integrator_tolerance", "integrator_dt", "Ttot", "schedule"],
 *               "optional": ["iter_lanczos", "do_lanczos_ortho"]
 *           }
 *         }
 *       ]
 *     }
 */
router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(collection, common.get_payload(req,'objs'), String(req.user._id), res, common.return);
});

/**
 * @api {get} /executables Query
 * @apiGroup Executables
 * @apiUse Query
 * @apiPermission user
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "name": "udyn"
 *       },
 *       "fields": [
 *         "owner",
 *         "path"
 *       ]
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": [
 *         {
 *           "_id": "130h0f1f0j",
 *           "owner": "10fj909j0",
 *           "path": "/users/ebrown/src/udyn/udyn"
 *         }
 *       ]
 *     }
 */
router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(collection, common.get_payload(req,'filter'), common.get_payload(req,'fields'), String(req.user._id), res, common.return);
});

/**
 * @api {get} /executables/count Count
 * @apiGroup Executables
 * @apiUse Count
 * @apiPermission user
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "owner": "10fj909j0"
 *       }
 *     }
 */
router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.count(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

/**
 * @api {put} /executables Update
 * @apiGroup Executables
 * @apiUse Update
 * @apiPermission user
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "name": "udyn"
 *       },
 *       "update": {
 *         "$set": {
 *           "name": "udyn2"
 *         }
 *       }
 *     }
 */
router.put('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update(collection, common.get_payload(req,'filter'), common.get_payload(req,'update'), String(req.user._id), res, common.return);
});

/**
 * @api {delete} /executables Delete
 * @apiGroup Executables
 * @apiUse Delete
 * @apiPermission user
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "name": "udyn"
 *       }
 *     }
 */
router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

module.exports = router;
