var fs = require('fs');
var express = require('express');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var config = require(libs + 'config');

var www = process.cwd() + '/libs/public/';
var cached_index = fs.readFileSync( www + 'index.html' );

var api_addr = config.get('api_address');
var server_token = config.get('WebAccessToken');

router.use('/css', express.static( www + "/css" ));
router.use('/scripts', express.static( www + "/scripts" ));
router.use('/images', express.static( www + "/images" ));
router.use('/docs', express.static( www + "/docs" ));
router.use('/favicon.ico', express.static( www + '/images/favicon.ico'));

router.get('/', function (req, res){
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Set-Cookie', ['server_token='+server_token, 'api_addr='+api_addr]);
    res.send( cached_index );
});

module.exports = router;
