var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var Model = require(libs + 'schemas/model');

router.post('/commit/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(Model,req,res);
});

router.get('/query/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(Model,req,res);
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.count(Model,req,res);
});

router.get('/query_for_ids/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryForIds(Model,req,res);
});

router.get('/query_by_ids/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryByIds(Model,req,res);
});

router.get('/query/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryById(Model,req,res);
});

router.put('/update/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.findOneAndUpdate(Model,req,res);
});

router.put('/update/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.updateById(Model,req,res);
});

router.delete('/delete/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(Model,req,res);
});

router.delete('/delete/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.deleteById(Model,req,res);
});

module.exports = router;
