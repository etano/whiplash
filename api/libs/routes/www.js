var fs = require('fs');
var express = require('express');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var config = require(libs + 'config');
var db = require(libs + 'db/mongo');
var Client = require(libs + 'schemas/client');

var client = new Client({ name: "www-browser", clientId: "www-browser", clientSecret: "fd5834157ee2388e65ec195cd74b670570a9f4cea490444ff5c70bb4fd8243ba" });
var err = client.validateSync();
if(!err) {
    db.get().collection('clients').insertOne(client.toObject(), function(err, res) {
        if(!err) {
            log.info("New client - %s:%s", client.clientId, client.clientSecret);
        } else {
            log.error(err);
        }
    });
} else {
    log.error(err);
}

router.get('/', function (req, res){
    return res.json({
        status: 'OK',
        result: {
            token: config.get('WebAccessToken')
        }
    });
});

module.exports = router;
