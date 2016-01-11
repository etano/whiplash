var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var config = require(libs + 'config');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('accesstokens');

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

module.exports = router;
