var express = require('express');
var passport = require('passport');
var router = express.Router();
var co = require('co');
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
    common.return_promise(res, Properties.query(common.get_payload(req,'filter'), common.get_payload(req,'fields'), req.user));
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
    common.return_promise(res, Properties.count(common.get_payload(req,'filter'), req.user));
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
    common.return_promise(res, Properties.update(common.get_payload(req,'filter'), common.get_payload(req,'update'), req.user));
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
    common.return_promise(res, Properties.update_one(common.get_payload(req,'filter'), common.get_payload(req,'update'), req.user));
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
    common.return_promise(res, Properties.delete(common.get_payload(req,'filter'), req.user));
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
    common.return_promise(res, Properties.stats(common.get_payload(req,'filter'), common.get_payload(req,'field'), map, req.user));
});

/**
 * @api {get} /properties/totals Totals
 * @apiGroup Properties
 * @apiUse Totals
 * @apiPermission user
 * @apiVersion 1.0.0
 */
router.get('/totals/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Properties.totals(common.get_payload(req,'filter'), common.get_payload(req,'target_field'), common.get_payload(req,'sum_field'), req.user));
});

module.exports = router;
