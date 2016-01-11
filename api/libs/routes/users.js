var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var config = require(libs + 'config');
var User = require(libs + 'schemas/user');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('users');

var webAuth = function(req, res, next){
    var token = common.get_payload(req,'server_token');
    if(token === config.get('WebAccessToken')) {
        next();
    } else {
        res.send("Bof");
    }
};

router.post('/', webAuth, function(req, res){
    var user = new User({ username: common.get_payload(req,'username'), password: common.get_payload(req,'password') });
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
    common.query(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

module.exports = router;
