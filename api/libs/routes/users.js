var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var users = db.get().collection('users');
var pass = require(libs + 'auth/pass');

/**
 * @api {get} /users QueryUsers
 * @apiGroup Authentication
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
    common.query(users, common.get_payload(req,'filter'), common.get_payload(req,'fields'), String(req.user._id), res, common.return);
});

/**
 * @api {delete} /users DeleteUser
 * @apiGroup Authentication
 * @apiUse Delete
 * @apiName DeleteUser
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
    var user_id = String(req.user._id);
    var filter = {};
    if(req.body.filter) filter = JSON.parse(req.body.filter);
    common.pop(users, filter, {}, user_id, res, function(res, err, obj) {
        if (!err) {
            common.delete(db.get().collection('accesstokens'), {owner: obj._id}, user_id, res, function(res, err, obj) {});
            common.delete(db.get().collection('refreshtokens'), {owner: obj._id}, user_id, res, function(res, err, obj) {});
            common.delete(db.get().collection('clients'), {userId: obj._id}, user_id, res, function(res, err, obj) {});
        }
        common.return(res, err, obj);
    });
});

function make_user(username, email, password, res) {
    if (username && email && password) {
        var salt = pass.generate_salt();
        var user = {
            username: username,
            email: email,
            salt: salt,
            hashed_password: pass.encrypt_password(salt, password),
            activated: false
        };
        common.commit(users, [user], "admin", res, function(res, err, result) {
            if(!err) {
                log.info("New user: %s", user.username);
                res.send("OK");
            } else {
                log.error(err);
                res.send("Bad entry");
            }
        });
    } else {
        log.error("Invalid username and/or password");
        res.send("Invalid username and/or password");
    }
}

/**
 * @api {post} /users CommitUser
 * @apiGroup Authentication
 * @apiName CommitUser
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
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     "OK"
 *
 */
router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    if (req.user.username === "admin") {
        var username = common.get_payload(req, 'username');
        var email = common.get_payload(req, 'email');
        var password = common.get_payload(req, 'password');
        make_user(username, email, password, res);
    } else {
        res.send("Unauthorized access to user creation");
    }
});

/**
 * @api {post} /users/admin SetAdminPassword
 * @apiGroup Authentication
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
    common.query(users, {"username":"admin"}, [], "admin", res, function(res, err, result) {
        if (!err && (result.length === 0)) {
            var password = common.get_payload(req, 'password');
            if (password) {
                make_user("admin", "admin@whiplash.ethz.ch", password, res);
            } else {
                res.send("Invalid password");
            }
        } else if (result.length > 0) {
            res.send("Admin password already set");
        } else {
            res.send("Unauthorized access to user creation");
        }
    });
});

/**
 * @api {get} /users/fresh FreshInstallation
 * @apiGroup Authentication
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
    common.query(users, {"username":"admin"}, [], "admin", res, function(res, err, result) {
        if (!err && (result.length === 0)) {
            res.send({error: null, result: true});
        } else if (result.length > 0) {
            res.send({error: null, result: false});
        } else {
            res.send({error: err, result: false});
        }
    });
});

module.exports = router;
