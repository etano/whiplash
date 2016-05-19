var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('properties');

/**
 * @api {get} /properties Query
 * @apiGroup Properties
 * @apiUse Query
 * @apiPermission user
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "status": "resolved"
 *       },
 *       "fields": {
 *         "input_model_id",
 *         "executable_id"
 *       }
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": [
 *         {
 *           "_id": "130h0f1f0j",
 *           "input_model_id": "0931jf0920",
 *           "executable_id": "2093j0afjk"
 *         }
 *       ]
 *     }

 */
router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(collection, common.get_payload(req,'filter'), common.get_payload(req,'fields'), String(req.user._id), res, common.return);
});

/**
 * @api {get} /properties/count Count
 * @apiGroup Properties
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
 * @api {put} /properties Update
 * @apiGroup Properties
 * @apiUse Update
 * @apiPermission user
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "owner": "10fj909j0"
 *       },
 *       "update": {
 *         "$set": {"status": "unresolved"}
 *       }
 *     }
 */
router.put('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update(collection, common.get_payload(req,'filter'), common.get_payload(req,'update'), String(req.user._id), res, common.return);
});

/**
 * @api {delete} /properties Delete
 * @apiGroup Properties
 * @apiUse Delete
 * @apiPermission user
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "owner": "10fj909j0"
 *       }
 *     }
 */
router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

/**
 * @api {stats} /properties/stats Stats
 * @apiGroup Properties
 * @apiUse Stats
 * @apiPermission user
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "status": "resolved"
 *       },
 *       "field": "timeout"
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

module.exports = router;
