var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var log = require(libs + 'log')(module);
var db = require(libs + 'db/mongo');
var collection = db.get().collection('models');

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
    common.commit(collection, common.get_payload(req,'objs'), String(req.user._id), res, common.return);
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
    var filter = common.get_payload(req,'filter');
    var fields = common.get_payload(req,'fields');
    common.query(collection, filter, fields, String(req.user._id), res, common.return);
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
    common.count(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
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
    common.update(collection, common.get_payload(req,'filter'), common.get_payload(req,'update'), String(req.user._id), res, common.return);
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
    common.delete(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
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
    common.stats(collection, common.get_payload(req,'filter'), common.get_payload(req,'field'), map, String(req.user._id), res, common.return);
});

/**
 * @api {get} /models/distinct Distinct
 * @apiGroup Models
 * @apiUse Distinct
 * @apiPermission user
 * @apiVersion 1.0.0
 */
router.get('/distinct/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.distinct(collection, common.get_payload(req,'filter'), common.get_payload(req,'fields'), String(req.user._id), res, common.return);
});

module.exports = router;
