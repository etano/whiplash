var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var clients = db.get().collection('clients');
var access_tokens = db.get().collection('access_tokens');
var refresh_tokens = db.get().collection('refresh_tokens');

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res){
    var user_id = String(req.user._id);
    var client = {
        name: common.get_payload(req,'client_name'),
        clientId: common.get_payload(req,'client_id'),
        clientSecret: common.get_payload(req,'client_secret')
    };
    common.commit(clients, [client], user_id, res, function(res, err, result) {
        if(!err) {
            log.info("New user client %s", client.clientId);
            return res.json({ status: 'OK' });
        } else {
            log.error(err);
            res.send("Bof");
        }
    });
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res){
    var user_id = String(req.user._id);
    common.query(clients, {}, [], user_id, res, function(res, err, client_objs) {
        if(!clients || err) {
            return res.send("Buf");
        } else {
            common.query(refresh_tokens, filter, [], user_id, res, function(res, err, refresh_token_objs) {
                if (err) { return res.send("Buf"); }
                common.query(access_tokens, filter, [], user_id, res, function(res, err, access_token_objs) {
                    if (err) { return res.send("Buf"); }
                    for(var i=0; i<client_objs.length; i++) {
                        for(var j=0; j<refresh_token_objs.length; j++) {
                            if(refresh_token_objs[j].clientId === client_objs[i].clientId) {
                                client_objs[i].refresh_token = refresh_token_objs[j].token;
                            }
                        }
                        for(var j=0; j<access_token_objs.length; j++) {
                            if(access_token_objs[j].clientId === client_objs[i].clientId) {
                                client_objs[i].access_token = access_token_objs[j].token;
                            }
                        }
                    }
                    return res.json({ status: 'OK', objs: client_objs });
                });
            });
        }
    });
});

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res){
    var client_id = common.get_payload(req,'client_id');
    var user_id = String(req.user._id);
    var filter = {
        clientId: client_id
    };
    common.delete(clients, filter, user_id, res, function(res, err, count) {
        if(err) {
            log.error('Error removing client',client_id,'for user',String(req.user._id));
            return res.send(err);
        } else {
            log.info('Removing client',client_id,'for user',String(req.user._id));
            common.delete(access_tokens, filter, user_id, res, function(res, err, count) {});
            common.delete(refresh_tokens, filter, user_id, res, function(res, err, count) {});
            return res.json({ status: 'OK' });
        }
    });
});

module.exports = router;
