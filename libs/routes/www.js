var fs = require('fs');
var crypto = require('crypto');
var express = require('express');
var router = express.Router();
var config = require(process.cwd() + '/libs/config');

var www = process.cwd() + '/libs/public/';
var cached_index = fs.readFileSync( www + 'index.html' );
config.set('WebAccessToken', crypto.randomBytes(32).toString('hex'));

router.use('/css', express.static( www + "/css" ));
router.use('/scripts', express.static( www + "/scripts" ));

router.get('/', function (req, res){
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Set-Cookie', 'access_token='+config.get('WebAccessToken'));
    res.send( cached_index );
});

module.exports = router;
