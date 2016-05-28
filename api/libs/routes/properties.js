var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var Properties = require(libs + 'collections/properties');

/**
 * @api {get} /properties Query
 * @apiGroup Properties
 * @apiUse Query
 * @apiPermission user
 * @apiVersion 1.0.0
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
    Properties.query(common.get_payload(req,'filter'), common.get_payload(req,'fields'), req.user, res, common.return);
});

/**
 * @api {get} /properties/count Count
 * @apiGroup Properties
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
    Properties.count(common.get_payload(req,'filter'), req.user, res, common.return);
});

/**
 * @api {put} /properties Update
 * @apiGroup Properties
 * @apiUse Update
 * @apiPermission user
 * @apiVersion 1.0.0
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
    Properties.update(common.get_payload(req,'filter'), common.get_payload(req,'update'), req.user, res, common.return);
});

/**
 * @api {put} /properties UpdateOne
 * @apiGroup Properties
 * @apiUse UpdateOne
 * @apiPermission user
 * @apiVersion 1.0.0
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
router.put('/one', passport.authenticate('bearer', { session: false }), function(req, res) {
    Properties.update_one(common.get_payload(req,'filter'), common.get_payload(req,'update'), req.user, res, common.return);
});

/**
 * @api {delete} /properties Delete
 * @apiGroup Properties
 * @apiUse Delete
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
router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    Properties.delete(common.get_payload(req,'filter'), req.user, res, common.return);
});

/**
 * @api {stats} /properties/stats Stats
 * @apiGroup Properties
 * @apiUse Stats
 * @apiPermission user
 * @apiVersion 1.0.0
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
    Properties.stats(common.get_payload(req,'filter'), common.get_payload(req,'field'), map, req.user, res, common.return);
});

module.exports = router;
