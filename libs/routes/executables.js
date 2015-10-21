var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var Executable = require(libs + 'schemas/executable');

router.post('/commit/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(Executable,req,res);
});

router.get('/query/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(Executable,req,res);
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.count(Executable,req,res);
});

router.get('/query_for_ids/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryForIds(Executable,req,res);
});

router.get('/query_by_ids/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryByIds(Executable,req,res);
});

router.get('/query/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryById(Executable,req,res);
});

router.put('/update/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.findOneAndUpdate(Executable,req,res);
});

router.put('/update/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.updateById(Executable,req,res);
});

router.delete('/delete/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(Executable,req,res);
});

router.delete('/delete/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.deleteById(Executable,req,res);
});

module.exports = router;
