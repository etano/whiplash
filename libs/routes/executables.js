var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var Executable = require(libs + 'schemas/executable');

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.save(Executable,req,res);
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find(Executable,req,res);
});

router.get('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.findById(Executable,req,res);
});

router.put('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.updateById(Executable,req,res);
});

router.delete('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.deleteById(Executable,req,res);
});

module.exports = router;
