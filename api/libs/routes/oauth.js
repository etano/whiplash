var express = require('express');
var libs = process.cwd() + '/libs/';
var oauth2 = require(libs + 'auth/oauth2');
var router = express.Router();

/**
 * @api {post} /users/token GetTokens
 * @apiGroup Authentication
 * @apiName GetTokens
 *
 * @apiParam {String} grant_type Type of authentication ("password").
 * @apiParam {String} username Username.
 * @apiParam {String} password password.
 * @apiParam {String} client_id ID of client.
 * @apiParam {String} client_secret Secret of client.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "grant_type"    : "password",
 *       "username"      : "myUsername",
 *       "password"      : "myPassword",
 *       "client_id"     : "myClient",
 *       "client_secret" : "myClientSecret"
 *     }
 *
 * @apiSuccess {String} access_token Granted access token.
 * @apiSuccess {String} refresh_token Granted refresh token.
 * @apiSuccess {String} expires_in Time in seconds before expiration.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "access_token": "13f-h9f-91f3j09f",
 *       "refesh_token": "fio3inf-1n-9n1vn",
 *       "expires_in": 604800
 *     }
 *
 */
router.post('/token', oauth2.token);

module.exports = router;
