var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');

router.get('/', function(req, res) {
    common.return(res, 0, global.timer.report());
});

router.get('/on', function(req, res) {
    common.return(res, 0, global.timer.enable());
});

router.get('/off', function(req, res) {
    common.return(res, 0, global.timer.disable());
});

module.exports = router;
