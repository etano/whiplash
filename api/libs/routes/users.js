var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var config = require(libs + 'config');
var User = require(libs + 'schemas/user');

var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('users');

var webAuth = function(req, res, next){
    var token = req.body.server_token;
    if(token === config.get('WebAccessToken')) {
        next();
    } else {
        res.send("Bof");
    }
};

router.post('/', webAuth, function(req, res){
    var user = new User({ username: req.body.username, password: req.body.password });
    user.save(function(err, user){
        if(!err) {
            log.info("New user: %s", user.username);
            res.send("OK");
        } else {
            log.error(err);
            res.send("Bof");
        }
    });
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: check for authorized user
    var filter = req.body;
    common.query(collection,filter,res);
});

router.get('/tokens/', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: check for authorized user
    var filter = req.body;
    common.query(db.get().collection('accesstokens'),filter,res);
});

module.exports = router;