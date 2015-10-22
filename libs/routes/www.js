var fs = require('fs');
var crypto = require('crypto');
var express = require('express');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var config = require(libs + 'config');
var Client = require(libs + 'schemas/client');

var www = process.cwd() + '/libs/public/';
var cached_index = fs.readFileSync( www + 'index.html' );
config.set('WebAccessToken', crypto.randomBytes(32).toString('hex'));

var client = new Client({ name: "www-browser", clientId: "www-browser", clientSecret: "fd5834157ee2388e65ec195cd74b670570a9f4cea490444ff5c70bb4fd8243ba" });
client.save(function(err, client){ if(!err) log.info("www client: %s", client.clientId); });

router.use('/css', express.static( www + "/css" ));
router.use('/scripts', express.static( www + "/scripts" ));
router.use('/images', express.static( www + "/scripts" ));
router.use('/docs', express.static( www + "/docs" ));
router.use('/favicon.ico', express.static( www + '/images/favicon.ico'));

router.get('/', function (req, res){
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Set-Cookie', 'access_token='+config.get('WebAccessToken'));
    res.send( cached_index );
});

module.exports = router;
