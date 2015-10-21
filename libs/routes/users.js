var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var config = require(libs + 'config');
var db = require(libs + 'db/mongoose');
var common = require(libs + 'routes/common');
var User = require(libs + 'schemas/user');
var Client = require(libs + 'schemas/client');

var webAuth = function(req, res, next){
    var token = req.body.access_token;
    if(token == config.get('WebAccessToken')) next();
    else res.send("Bof");
}

router.post('/', webAuth, 
    function(req, res, next){
        var user = new User({ username: req.body.username, password: req.body.password });
        user.save(function(err, user){
            if(!err){
                log.info("New user: %s", user.username);
                next();
            } else {
                res.send("Bof"); log.error(err);
            }
        });
    }, 
    function(req, res){
        var client = new Client({ name: req.body.cname, clientId: req.body.cid, clientSecret: req.body.secret });
        client.save(function(err, client){
            if(!err){
                log.info("New client: %s", client.clientId);
                res.send("Ok");
            }else {
                res.send("Bof"); log.error(err);
            }
        });
    }
);

router.get('/query/:id', webAuth, function(req, res) {
    common.queryById(User, req, res);
});

router.put('/update/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.updateById(User, req, res);
});

router.delete('/delete/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.deleteById(User, req, res);
});

module.exports = router;
