var express = require('express');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var config = require(libs + 'config');
var db = require(libs + 'db/mongo');
var common = require(libs + 'routes/common');

var client = {
    name: "www-browser",
    clientId: "www-browser",
    clientSecret: "fd5834157ee2388e65ec195cd74b670570a9f4cea490444ff5c70bb4fd8243ba"
};

common.commit(db.get().collection('clients'), [client], "passport", {}, function(res, err, result) {
    if(!err) {
        if (result["n_new"]>0) {
            log.info("New client - %s:%s", client.clientId, client.clientSecret);
        } else {
            log.debug("Client already exists - %s:%s", client.clientId, client.clientSecret);
        }
    } else {
        log.error(err);
    }
});

router.get('/', function (req, res){
    return res.json({
        status: 'OK',
        result: {
            token: config.get('WebAccessToken')
        }
    });
});

module.exports = router;
