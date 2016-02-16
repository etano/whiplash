var express = require('express');
var passport = require('passport');
var emailjs = require('emailjs');
var router = express.Router();
var crypto = require('crypto');

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

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(collection, common.get_payload(req,'filter'), common.get_payload(req,'fields'), String(req.user._id), res, common.return);
});


function hash_password(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    //more secure - this.salt = crypto.randomBytes(128).toString('hex');
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
}

function generate_hash(salt, username) {
    return crypto.createHmac('sha1', salt).update(username).digest('hex');
}

function check_password(salt, password, hashed_password) {
    return encrypt_password(salt, password) === hashed_password;
}

function check_hash(hash, salt, username) {
    return hash === generate_hash(salt, username);
}

function generate_salt() {
    return crypto.randomBytes(32).toString('hex');
}

function encrypt_password(salt, password) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
}

router.post('/', webAuth, function(req, res){
    var salt = generate_salt();
    var password = common.get_payload(req, 'password');
    var user = {
        username: common.get_payload(req, 'username'),
        email: common.get_payload(req, 'email'),
        salt: salt,
        hashedPassword: encrypt_password(salt, password),
    };
    common.commit(collection, [user], "", res, function(res, err, result) {
        if(!err) {
            log.info("New user: %s", user.username);
            res.send("OK");

            var hash = generate_hash(user.salt, user.username);
            var email_addr = user.email;
            var activation = "http://whiplash.ethz.ch/api/users/confirm?uid=" +user.userId+ "&hash=" +hash;
            var email_text = "You are now signed up to the Whiplash. Activation link: " +activation;
            var email_html = "<html>You <i>are</i> now signed up in the Whiplash! Activate your account by clicking <a href='" +activation+ "'>this link</a>.</html>";
        
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
    common.query(collection, {'_id': uid}, [], "", res, function(res, err, user_objs) {
        if(!err){
            var user = user_objs[0];
            if(check_hash(hash, user.salt, user.username)){
                user.activated = true;
                common.replace(collection, [user], "", res, function(res, err, n_modified) {
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
    var user = common.get_payload(req,'username');

    User.findOne({ username: user }, function(err, user){
        if(!err){
            var hash = user.generateHash();
            var code = user.encryptPassword(new_pwd);
            var activation = "http://whiplash.ethz.ch/api/users/recover?uid=" +user.userId+ "&hash=" +hash+ "&code=" +code;
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

    User.findById(uid, function(err, user){
        if(!err){
            if(user.check_hash(hash)){
                user.hashedPassword = code;
                user.save(function(err){
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
