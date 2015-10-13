var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var Model = require(libs + 'schemas/model');

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.save(Model,req,res);
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find(Model,req,res);
});

router.get('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.findById(Model,req,res);
});

router.put('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.updateById(Model,req,res);
});

router.delete('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.deleteById(Model,req,res);
});

module.exports = router;
