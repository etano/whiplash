var express = require('express');
var passport = require('passport');
var router = express.Router();
var co = require('co');

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var Clients = require(libs + 'collections/clients');
var AccessTokens = require(libs + 'collections/access_tokens');
var RefreshTokens = require(libs + 'collections/refresh_tokens');

/**
 * @api {post} /clients CommitOne
 * @apiGroup Clients
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
router.post('/one', passport.authenticate('bearer', { session: false }), function(req, res) {
    co(function *() {
        if (req.user.username !== "admin")
            throw "Unauthorized access to client creation";
        var client = {
            name: common.get_payload(req,'client_name'),
            client_id: common.get_payload(req,'client_id'),
            client_secret: common.get_payload(req,'client_secret')
        };
        var owner = common.get_payload(req,'owner');
        var result = yield Clients.commit_one(client, {_id: owner});
        log.info("New user client %s", client.client_id);
        return result;
    }).then(function(result) {
        common.return(res, 0, result);
    }).catch(function(err) {
        common.return(res, err, 0);
    });
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
    co(function *() {
        if (req.user.username !== "admin")
            throw "Unauthorized access to client deletion";
        var client_id = common.get_payload(req,'client_id');
        var filter = {client_id: client_id};
        var count = yield Clients.delete(filter, req.user);
        log.info('Removing client', client_id, 'for user', req.user._id);
        AccessTokens.delete(filter, req.user);
        RefreshTokens.delete(filter, req.user);
        return count;
    }).then(function(count) {
        common.return(res, 0, count);
    }).catch(function(err) {
        common.return(res, err, 0);
    });
});

/**
 * @api {get} /clients Update
 * @apiGroup Authentication
 * @apiUse Update
 * @apiPermission admin
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "username": "myUsername"
 *       },
 *       "update": {
 *         "$set": {"email": "new@email.com}},
 *       }
 *     }
 *
 */
router.put('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    co(function *() {
        if (req.user.username !== "admin")
            throw "Unauthorized access to client updating";
        return yield Clients.update(common.get_payload(req,'filter'), common.get_payload(req,'update'), req.user);
    }).then(function(obj) {
        common.return(res, 0, obj);
    }).catch(function(err) {
        common.return(res, err, 0);
    });
});

module.exports = router;
