var express = require('express');
var passport = require('passport');
var router = express.Router();
var co = require('co');
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var Models = require(libs + 'collections/models');

/**
 * @api {post} /models Commit
 * @apiGroup Models
 * @apiUse Commit
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "objs": [
 *         {
 *           "n_spins": 4,
 *           "name": "example0",
 *           "lattice": "square",
 *           "content": 0
 *         },
 *         {
 *           "n_spins": 5,
 *           "name": "example1",
 *           "lattice": "cubic"
 *         },
 *       ]
 *     }
 */
router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Models.commit(common.get_payload(req,'objs'), req.user));
});

/**
 * @api {post} /models CommitOne
 * @apiGroup Models
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
    common.return_promise(res, Models.commit_one(common.get_payload(req,''), req.user));
});

/**
 * @api {get} /models Query
 * @apiGroup Models
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
    common.return_promise(res, Models.query(common.get_payload(req,'filter'), common.get_payload(req,'fields'), req.user));
});

/**
 * @api {get} /models QueryOne
 * @apiGroup Models
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
    common.return_promise(res, Models.query_one(common.get_payload(req,'filter'), common.get_payload(req,'fields'), req.user));
});

/**
 * @api {get} /models/count Count
 * @apiGroup Models
 * @apiUse Count
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "n_spins": {"$in": [4,5,6]}
 *       }
 *     }
 */
router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Models.count(common.get_payload(req,'filter'), req.user));
});

/**
 * @api {put} /models Update
 * @apiGroup Models
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
    common.return_promise(res, Models.update(common.get_payload(req,'filter'), common.get_payload(req,'update'), req.user));
});

/**
 * @api {delete} /models Delete
 * @apiGroup Models
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
    common.return_promise(res, Models.delete(common.get_payload(req,'filter'), req.user));
});

/**
 * @api {stats} /models/stats Stats
 * @apiGroup Models
 * @apiUse Stats
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "name": "example0"
 *       },
 *       "field": "n_spins"
 *     }
 */
router.get('/stats/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var map = function () {
                  emit(this.owner, {
                      sum: this[field],
                      max: this[field],
                      min: this[field],
                      count: 1,
                      diff: 0
                  });
              };
    common.return_promise(res, Models.stats(common.get_payload(req,'filter'), common.get_payload(req,'field'), map, req.user));
});

/**
 * @api {get} /models/distinct Distinct
 * @apiGroup Models
 * @apiUse Distinct
 * @apiPermission user
 * @apiVersion 1.0.0
 */
router.get('/distinct/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Models.distinct(common.get_payload(req,'filter'), common.get_payload(req,'field'), req.user));
});

/**
 * @api {get} /models/totals Totals
 * @apiGroup Models
 * @apiUse Totals
 * @apiPermission user
 * @apiVersion 1.0.0
 */
router.get('/totals/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Models.totals(common.get_payload(req,'filter'), common.get_payload(req,'target_field'), common.get_payload(req,'sum_field'), req.user));
});



module.exports = router;
