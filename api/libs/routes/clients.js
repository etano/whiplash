var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var Clients = require(libs + 'collections/clients');
var AccessTokens = require(libs + 'collections/access_tokens');
var RefreshTokens = require(libs + 'collections/refresh_tokens');

/**
 * @api {post} /clients CommitClient
 * @apiGroup Authentication
 * @apiName CommitClient
 * @apiPermission admin
 * @apiVersion 1.0.0
 *
 * @apiParam {String} client_name Name of client.
 * @apiParam {String} client_id ID of client.
 * @apiParam {String} client_secret Secret of client.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "client_name": "myScript",
 *       "client_id": "myClientID",
 *       "client_secret": "myClientSecret"
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     "OK"
 *
 */
router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    if (req.user.username === "admin") {
        var client = {
            name: common.get_payload(req,'client_name'),
            client_id: common.get_payload(req,'client_id'),
            client_secret: common.get_payload(req,'client_secret')
        };
        var owner = common.get_payload(req,'owner');
        Clients.commit([client], owner, res, function(res, err, result) {
            if(!err) {
                log.info("New user client %s", client.client_id);
                return res.json({ status: 'OK' });
            } else {
                log.error(err);
                res.send("Bof");
            }
        });
    } else {
        return res.json({status: 666, error: "Unauthorized access to client creation"});
    }
});

/**
 * @api {delete} /clients DeleteClient
 * @apiGroup Authentication
 * @apiName DeleteClient
 * @apiPermission admin
 * @apiVersion 1.0.0
 *
 * @apiParam {String} client_id ID of client.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "client_id": "myClientID",
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     "OK"
 *
 */
router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res){
    if (req.user.username === "admin") {
        var client_id = common.get_payload(req,'client_id');
        var user_id = String(req.user._id);
        var filter = {
            client_id: client_id
        };
        Clients.delete(filter, user_id, res, function(res, err, count) {
            if(err) {
                log.error('Error removing client',client_id,'for user',String(req.user._id));
                return res.send(err);
            } else {
                log.info('Removing client',client_id,'for user',String(req.user._id));
                AccessTokens.delete(filter, user_id, res, function(res, err, count) {});
                RefreshTokens.delete(filter, user_id, res, function(res, err, count) {});
                return res.json({ status: 'OK' });
            }
        });
    } else {
        return res.json({status: 666, error: "Unauthorized access to client deletion"});
    }
});

module.exports = router;
