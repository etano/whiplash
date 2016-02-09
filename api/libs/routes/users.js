var express = require('express');
var passport = require('passport');
var emailjs = require('emailjs');
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

    var user = new User({ username: common.get_payload(req,'username'),
                          password: common.get_payload(req,'password'),
                          email:    common.get_payload(req,'email'   ) });

    user.save(function(err, user){
        if(!err) {
            log.info("New user: %s", user.username);
            res.send("OK");

            var hash = user.generateHash();
            var email_addr = common.get_payload(req,'email');
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

    User.findById(uid, function(err, user){
        if(err) throw err;
        if(user.checkHash(hash)){
            user.activated = true;
            user.save(function(err){
                if (err) throw err;
                log.info('User successfully activated!');
                res.redirect('http://whiplash.ethz.ch');
            });
        }else{
            res.send("Not Authorized");
        }
    });

});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(collection, req.body, String(req.user._id), res, common.return);
});

module.exports = router;
