var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var db = require(libs + 'db/mongoose');
var common = require(libs + 'routes/common');
var Client = require(libs + 'schemas/client');

router.post('/', passport.authenticate('bearer', { session: false }),
    function(req, res){
        var client = new Client({ name: req.body.client_name, clientId: req.body.client_id, clientSecret: req.body.client_secret, userId: req.user._id });
        client.save(function(err, client){
            if(!err){
                log.info("New user client %s", client.clientId);
                res.send("OK");
            }else{
                log.error(err);
                res.send("Bof");
            }
        });
    }
);

router.get('/', passport.authenticate('bearer', { session: false }),
    function(req, res){
        Client.find({ userId : req.user._id }, function (err, objs) {
            if(!objs || err) return res.send("Buf");
            return res.json({ status: 'OK', objs: objs });
        });
    }
);

module.exports = router;
