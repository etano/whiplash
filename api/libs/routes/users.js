var express = require('express');
var passport = require('passport');
var router = express.Router();
var co = require('co');

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

var pass = require(libs + 'auth/pass');
var common = require(libs + 'routes/common');
var Users = require(libs + 'collections/users');
var AccessTokens = require(libs + 'collections/access_tokens');
var RefreshTokens = require(libs + 'collections/refresh_tokens');
var Clients = require(libs + 'collections/clients');

/**
 * @api {get} /users QueryUsers
 * @apiGroup Users
 * @apiUse Query
 * @apiName QueryUsers
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "username": "myUsername"
 *       },
 *       "fields": [
 *         "email",
 *         "username"
 *       ]
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": [
 *         {
 *           "_id": "130h0f1f0j",
 *           "email": "myEmail@whiplash.ethz.ch",
 *           "username": "myUsername"
 *         }
 *       ]
 *     }
 */
router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Users.query(common.get_payload(req,'filter'), common.get_payload(req,'fields'), req.user));
});


/**
 * @api {get} /users QueryOne
 * @apiGroup Users
 * @apiUse QueryOne
 * @apiName QueryOne
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "username": "myUsername"
 *       },
 *       "fields": [
 *         "email",
 *         "username"
 *       ]
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "result": {
 *           "_id": "130h0f1f0j",
 *           "email": "myEmail@whiplash.ethz.ch",
 *           "username": "myUsername"
 *         }
 *     }
 */
router.get('/one', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Users.query_one(common.get_payload(req,'filter'), common.get_payload(req,'fields'), req.user));
});

/**
 * @api {get} /users UpdateOne
 * @apiGroup UpdateOne
 * @apiUse UpdateOne
 * @apiPermission user
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
router.put('/one', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.return_promise(res, Users.update_one(common.get_payload(req,'filter'), common.get_payload(req,'update'), req.user));
});

/**
 * @api {delete} /users Delete
 * @apiGroup Users
 * @apiUse Delete
 * @apiPermission user
 * @apiVersion 1.0.0
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "filter": {
 *         "username": "myUsername"
 *       }
 *     }
 *
 */
router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = {};
    if(req.body.filter) filter = JSON.parse(req.body.filter);
    co(function *() {
        var user = Users.pop(filter, {}, req.user);
        AccessTokens.delete({owner: obj._id}, req.user);
        RefreshTokens.delete({owner: obj._id}, req.user);
        Clients.delete({user_id: obj._id}, req.user);
        return user;
    }).then(function(obj) {
        common.return(res, 0, obj);
    }).catch(function(err) {
        common.return(res, err, 0);
    });
});

function make_user(username, email, password, res) {
    co(function *() {
        if (!(username && email && password))
            throw "Invalid username and/or password";
        var salt = pass.generate_salt();
        var user = {
            username: username,
            email: email,
            salt: salt,
            hashed_password: pass.encrypt_password(salt, password),
            activated: false
        };
        return yield Users.commit_one(user, {username: "admin"});
    }).then(function(result) {
        log.info("New user");
        res.send({status: "OK", result: result});
    }).catch(function(err) {
        log.error(err);
        var message = "";
        if (err.errmsg) {
            if (err.errmsg.indexOf('username')>0)
                message += "Username already in use. ";
            if (err.errmsg.indexOf('email')>0)
                message += "Email already in use. ";
        } else {
            message = err;
        }
        res.send({status: 500, error: message});
    });
}

/**
 * @api {post} /users CommitOne
 * @apiGroup Users
 * @apiUse CommitOne
 * @apiPermission admin
 * @apiVersion 1.0.0
 *
 * @apiParam {String} username Username.
 * @apiParam {String} email Email.
 * @apiParam {String} password Password.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "username": "myUsername",
 *       "email": "myEmail@whiplash.ethz.ch",
 *       "password": "myPassword"
 *     }
 *
 */
router.post('/one', passport.authenticate('bearer', {session: false}), function(req, res) {
    if (req.user.username === "admin") {
        var username = common.get_payload(req, 'username');
        var email = common.get_payload(req, 'email');
        var password = common.get_payload(req, 'password');
        make_user(username, email, password, res);
    } else {
        res.send({status: 500, error: "Unauthorized access to user creation"});
    }
});

/**
 * @api {post} /users/admin SetAdminPassword
 * @apiGroup Users
 * @apiName SetAdminPassword
 * @apiPermission admin
 * @apiVersion 1.0.0
 *
 * @apiParam {String} password Admin password.
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "password": "myAdminPassword"
 *     }
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     "OK"
 *
 */
router.post('/admin', function(req, res) {
    co(function *() {
        var user = yield Users.query_one({username: "admin"}, [], {username: "admin"});
        if (user)
            throw "Admin password already set";
        var password = common.get_payload(req, 'password');
        if (!password)
            throw "Invalid password";
        make_user("admin", "admin@whiplash.ethz.ch", password, res);
    }).catch(function(err) {
        log.error(err);
        common.return(res, err, 0);
    });
});

/**
 * @api {get} /users/fresh FreshInstallation
 * @apiGroup Users
 * @apiName FreshInstallation
 * @apiDescription Determines whether or not the API server has an admin account yet or not.
 * @apiVersion 1.0.0
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       error: null,
 *       result: true
 *     }
 *
 */
router.get('/fresh', function(req, res) {
    co(function *() {
        var user = yield Users.query_one({username: "admin"}, [], {username: "admin"});
        if (user)
            return false;
        return true;
    }).then(function(obj) {
        common.return(res, 0, obj);
    }).catch(function(err) {
        common.return(res, err, 0);
    });
});

module.exports = router;
