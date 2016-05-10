var express = require('express');
var passport = require('passport');
var emailjs = require('emailjs');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var config = require(libs + 'config');
var db = require(libs + 'db/mongo');
var users = db.get().collection('users');
var pass = require(libs + 'auth/pass');

var webAuth = function(req, res, next){
    var token = common.get_payload(req,'server_token');
    if(token === config.get('WebAccessToken')) {
        next();
    } else {
        res.send("Bof");
    }
};

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(users, common.get_payload(req,'filter'), common.get_payload(req,'fields'), String(req.user._id), res, common.return);
});

router.post('/', webAuth, function(req, res){
    var salt = pass.generate_salt();
    var password = common.get_payload(req, 'password');
    var user = {
        username: common.get_payload(req, 'username'),
        email: common.get_payload(req, 'email'),
        salt: salt,
        hashed_password: pass.encrypt_password(salt, password),
        activated: false
    };
    common.commit(users, [user], "user_admin", res, function(res, err, result) {
        if(!err) {
            log.info("New user: %s", user.username);
            res.send("OK");

            var hash = pass.generate_hash(user.salt, user.username);
            var email_addr = user.email;
            var activation = "http://whiplash.ethz.ch/api/users/confirm?uid=" +user._id+ "&hash=" +hash;
            var email_text = "You are now signed up to the Whiplash. Activation link: " +activation;
            var email_html = "<html>You <i>are</i> now signed up for Project Whiplash! Activate your account by clicking <a href='" +activation+ "'>this link</a>.</html>";

            emailjs.server
            .connect({
                host:    "smtp.phys.ethz.ch",
                ssl:     true
            })
            .send({
                from:    "Project Whiplash <auto@whiplash.ethz.ch>",
                to:      email_addr,
                subject: "Welcome to Whiplash",
                text:    email_text,
                attachment: [{ data: email_html, alternative:true }]
            }, function(err, message){ log.info(err || message); });
        } else {
            log.error(err);
            res.send("Bof");
        }
    });

});

router.get('/confirm', function(req, res) {
    var uid = req.query['uid'];
    var hash = req.query['hash'];
    common.query_one(users, {'_id': uid}, [], "user_admin", res, function(res, err, user) {
        if(!err){
            if(pass.check_hash(hash, user.salt, user.username)){
                user.activated = true;
                common.replace(users, [user], "user_admin", res, function(res, err, n_modified) {
                    if(!err) {
                        log.info('User successfully activated!');
                        res.redirect('http://whiplash.ethz.ch');
                    }
                });
            }else{
                res.send("Not Authorized");
            }
        }
    });
});

router.post('/recover', webAuth, function(req, res){

    var new_pwd = common.get_payload(req,'password');
    var username = common.get_payload(req,'username');

    common.query_one(users, {'username': username}, [], "user_admin", res, function(res, err, user) {
        if(!err){
            var hash = pass.generate_hash(user.salt, user.username);
            var code = pass.encrypt_password(user.salt, new_pwd);
            var activation = "http://whiplash.ethz.ch/api/users/recover?uid=" +user._id+ "&hash=" +hash+ "&code=" +code;
            var email_text = "You have provided a new password. To active the new password follow the link: " +activation;
            var email_html = "<html>You have provided a new password. To activate the new password follow <a href='" +activation+ "'>this link</a>.</html>";

            emailjs.server
            .connect({
                host:    "smtp.phys.ethz.ch",
                ssl:     true
            })
            .send({
                from:    "Project Whiplash <auto@whiplash.ethz.ch>", 
                to:      user.email,
                subject: "password reset",
                text:    email_text,
                attachment: [{ data: email_html, alternative:true }]
            }, function(err, message){ log.info(err || message); });

            log.info("Recovery for user: %s", user.username);
            res.send("OK");
        }
    });
});

router.get('/recover', function(req, res) {

    var uid = req.query['uid'];
    var hash = req.query['hash'];
    var code = req.query['code'];

    common.query_one(users, {'_id': uid}, [], "user_admin", res, function(res, err, user) {
        if(!err){
            if(pass.check_hash(hash, user.salt, user.username)){
                user.hashed_password = code;
                common.replace(users, [user], "user_admin", res, function(res, err, n_modified) {
                    if(!err){
                        log.info('User successfully activated!');
                        res.redirect('http://whiplash.ethz.ch');
                    }
                });
            }else{
                res.send("Not Authorized");
            }
        }
    });
});

module.exports = router;
