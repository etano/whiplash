var express = require('express');
var http = require('http');
var router = express.Router();
var wdb = require(process.cwd()+'/libs/whiplash');

router.get('/:user', function(req, res, next) {
    var username = req.params.user;
    var token = req.query.access_token;

    wdb.get().query_one("users", token, {username: username}).then(function(user) {
        if (username !== user.username)
            throw 'Wrong user';
        if (user.username === "admin") {
            res.render('admin', {
                authorized: true
            });
        } else {
            res.render('user', {
                authorized: true,
                user: user.username
            });
        }
    }).catch(function(err) {
        console.log(err);
        res.redirect('/login');
    });

});

module.exports = router;
