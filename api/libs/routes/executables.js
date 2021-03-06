var express = require('express');
var passport = require('passport');
var router = express.Router();
var co = require('co');
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var Executables = require(libs + 'collections/executables');

/**
 * @api {post} /executables Commit
 * @apiGroup Executables
 * @apiUse Commit
 * @apiPermission user
 * @apiVersion 1.0.0
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
    common.return_promise(res, Executables.commit(common.get_payload(req,'objs'), req.user));
});

/**
 * @api {post} /executables CommitOne
 * @apiGroup Executables
 * @apiUse CommitOne
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParam {String} name Name of executable.
 * @apiParam {String} path Path to executable or url of Docker container.
 * @apiParam {Object} params Necessary parameters.
 * @apiParamExample {json} Request-Example:
 *     {
 *       {
 *         "name": "udyn",
 *         "algorithm": "SQA-UE",
 *         "version": "1.1",
 *         "build": "O3",
 *         "path": "/users/ebrown/src/udyn/udyn",
 *         "description": "real-time evolution with RungeKutta",
 *         "params": {
 *             "required": ["integrator_type", "integrator_tolerance", "integrator_dt", "Ttot", "schedule"],
 *             "optional": ["iter_lanczos", "do_lanczos_ortho"]
 *         }
 *       }
 *     }
 */
router.post('/one', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Executables.commit_one(common.get_payload(req,''), req.user));
});



/**
 * @api {get} /executables Query
 * @apiGroup Executables
 * @apiUse Query
 * @apiPermission user
 * @apiVersion 1.0.0
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
    common.return_promise(res, Executables.query(common.get_payload(req,'filter'), common.get_payload(req,'fields'), req.user));
});

/**
 * @api {get} /executables QueryOne
 * @apiGroup Executables
 * @apiUse QueryOne
 * @apiPermission user
 * @apiVersion 1.0.0
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
 *       "result": {
 *           "_id": "130h0f1f0j",
 *           "owner": "10fj909j0",
 *           "path": "/users/ebrown/src/udyn/udyn"
 *       }
 *     }
 */
router.get('/one', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Executables.query_one(common.get_payload(req,'filter'), common.get_payload(req,'fields'), req.user));
});

/**
 * @api {get} /executables/count Count
 * @apiGroup Executables
 * @apiUse Count
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "owner": "10fj909j0"
 *       }
 *     }
 */
router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Executables.count(common.get_payload(req,'filter'), req.user));
});

/**
 * @api {put} /executables Update
 * @apiGroup Executables
 * @apiUse Update
 * @apiPermission user
 * @apiVersion 1.0.0
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
    common.return_promise(res, Executables.update(common.get_payload(req,'filter'), common.get_payload(req,'update'), req.user));
});

/**
 * @api {delete} /executables Delete
 * @apiGroup Executables
 * @apiUse Delete
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "name": "udyn"
 *       }
 *     }
 */
router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Executables.delete(common.get_payload(req,'filter'), req.user));
});

module.exports = router;
