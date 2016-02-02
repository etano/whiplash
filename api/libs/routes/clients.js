var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var Client = require(libs + 'schemas/client');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('clients');
var crypto = require('crypto');

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res){
    var client = new Client({ name: common.get_payload(req,'client_name'), clientId: common.get_payload(req,'client_id'), clientSecret: common.get_payload(req,'client_secret'), userId: String(req.user._id) });
    client.save(function(err, client){
        if(!err){
            log.info("New user client %s", client.clientId);
            return res.json({ status: 'OK' });
        }else{
            log.error(err);
            res.send("Bof");
        }
    });
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res){
    var filter = { userId : String(req.user._id) };
    collection.find(filter).toArray(function (err, clients) {
        if(!clients || err) {
            return res.send("Buf");
        } else {
           db.get().collection('refreshtokens').find(filter).toArray(function (err, refreshTokens) {
               db.get().collection('accesstokens').find(filter).toArray(function (err, accessTokens) {
                   for(var i=0; i<clients.length; i++) {
                       for(var j=0; j<refreshTokens.length; j++) {
                           if(refreshTokens[j].clientId == clients[i].clientId) {
                               clients[i].refreshToken = refreshTokens[j].token;
                           }
                       }
                       for(var j=0; j<accessTokens.length; j++) {
                           if(accessTokens[j].clientId == clients[i].clientId) {
                               clients[i].accessToken = accessTokens[j].token;
                           }
                       }
                   }
                   return res.json({ status: 'OK', objs: clients });
               });
           });
        }
    });
});

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res){
    var client_id = common.get_payload(req,'client_id');
    var filter = { userId : String(req.user._id) , clientId : client_id };
    collection.deleteOne(filter, {}, function (err, result) {
        if(err) {
            log.error('Error removing client',client_id,'for user',String(req.user._id));
            return res.send(err);
        } else {
            log.info('Removing client',client_id,'for user',String(req.user._id));
            db.get().collection('refreshtokens').deleteOne(filter, {}, function (err, result2) {});
            db.get().collection('accesstokens').deleteOne(filter, {}, function (err, result2) {});
            return res.json({ status: 'OK' });
        }
    });
});

module.exports = router;
