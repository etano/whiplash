var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var Object = require(libs + 'schemas/model');

router.post('/commit/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(Object,req,res);
});

router.get('/query/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(Object,req,res);
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.count(Object,req,res);
});

router.get('/query_for_ids/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryForIds(Object,req,res);
});

router.get('/query_by_ids/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryByIds(Object,req,res);
});

router.get('/query/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryById(Object,req,res);
});

router.put('/update/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.findOneAndUpdate(Object,req,res);
});

router.put('/update/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.updateById(Object,req,res);
});

router.delete('/delete/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(Object,req,res);
});

router.delete('/delete/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.deleteById(Object,req,res);
});

module.exports = router;
