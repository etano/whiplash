var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var config = require(libs + 'config');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('accesstokens');

/**
 * @api {get} /accesstokens QueryAccessTokens
 * @apiGroup Authentication
 * @apiUse Query
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "clientId": "myClientID"
 *       },
 *       "fields": [
 *         "owner",
 *         "token"
 *       ]
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": [
 *         {
 *           "_id": "130h0f1f0j",
 *           "owner": "10f203jf0",
 *           "token": "0913jf01j3f09j03j1f019j"
 *         }
 *       ]
 *     }
 */
router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(collection, common.get_payload(req,'filter'), common.get_payload(req,'fields'), String(req.user._id), res, common.return);
});

module.exports = router;
