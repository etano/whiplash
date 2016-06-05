var express = require('express');
var passport = require('passport');
var router = express.Router();
var co = require('co');
var libs = process.cwd()+'/libs/';
var log = require(libs+'log')(module);
var common = require(libs+'routes/common');
var AccessTokens = require(libs+'collections/access_tokens');

/**
 * @api {get} /accesstokens Query
 * @apiGroup AccessTokens
 * @apiUse Query
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "client_id": "myClientID"
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
 *
 */
router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, AccessTokens.query(common.get_payload(req,'filter'), common.get_payload(req,'fields'), req.user));
});

module.exports = router;
