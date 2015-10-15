var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var Property = require(libs + 'schemas/property');

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.save(Property,req,res);
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find(Property,req,res);
});

router.get('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.findById(Property,req,res);
});

router.put('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.updateById(Property,req,res);
});

router.delete('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.deleteById(Property,req,res);
});

module.exports = router;
