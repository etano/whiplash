var express = require('express');
var passport = require('passport');
var router = express.Router();
var co = require('co');
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var Sets = require(libs + 'collections/sets');

/**
 * @api {post} /sets Commit
 * @apiGroup Sets
 * @apiUse Commit
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "objs": [
 *         {
 *           "ids": ["2foi12-g9g", "309jfas0dj"],
 *           "description": "The is a set of ids",
 *         },
 *         {
 *           "ids": ["2foi12-g9g", "309jfas0dj"],
 *           "description": "The is another set of ids",
 *         },
 *       ]
 *     }
 */
router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Sets.commit(common.get_payload(req,'objs'), req.user));
});

/**
 * @api {post} /sets CommitOne
 * @apiGroup Sets
 * @apiUse CommitOne
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "n_spins": 4,
 *       "name": "example0",
 *       "lattice": "square",
 *       "content": 0
 *     }
 */
router.post('/one', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Sets.commit_one(common.get_payload(req,''), req.user));
});

/**
 * @api {get} /sets Query
 * @apiGroup Sets
 * @apiUse Query
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "n_spins": {"$in": [4,5,6]}
 *       },
 *       "fields": [
 *         "name",
 *         "lattice"
 *       ]
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": [
 *         {
 *           "_id": "130h0f1f0j",
 *           "name": "example0",
 *           "lattice": "square"
 *         },
 *         {
 *           "_id": "10hf01h3fk",
 *           "name": "example1",
 *           "lattice": "cubic"
 *         }
 *       ]
 *     }
 */
router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Sets.query(common.get_payload(req,'filter'), common.get_payload(req,'fields'), req.user));
});

/**
 * @api {get} /sets QueryOne
 * @apiGroup Sets
 * @apiUse QueryOne
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "n_spins": {"$in": [4,5,6]}
 *       },
 *       "fields": [
 *         "name",
 *         "lattice"
 *       ]
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": {
 *           "_id": "130h0f1f0j",
 *           "name": "example0",
 *           "lattice": "square"
 *       }
 *     }
 */
router.get('/one', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Sets.query_one(common.get_payload(req,'filter'), common.get_payload(req,'fields'), req.user));
});

/**
 * @api {put} /sets Update
 * @apiGroup Sets
 * @apiUse Update
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "name": "example0"
 *       },
 *       "update": {
 *         "$set": {
 *           "name": "example0b"
 *         }
 *       }
 *     }
 */
router.put('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Sets.update(common.get_payload(req,'filter'), common.get_payload(req,'update'), req.user));
});

/**
 * @api {delete} /sets Delete
 * @apiGroup Sets
 * @apiUse Delete
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "name": "example0"
 *       }
 *     }
 */
router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Sets.delete(common.get_payload(req,'filter'), req.user));
});

/**
 * @api {get} /sets/count Count
 * @apiGroup Sets
 * @apiUse Count
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "name": "example0"
 *       }
 *     }
 */
router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Sets.count(common.get_payload(req,'filter'), req.user));
});

module.exports = router;
