var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var Object = require(libs + 'schemas/executable');

//
// Commit
//

router.post('/commit/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(Object,req,res);
});

//
// Query
//

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.count(Object,req,res);
});

router.get('/query/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(Object,req,res);
});

router.get('/query_for_ids/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_for_ids(Object,req,res);
});

router.get('/query_by_id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_by_id(Object,req,res);
});

//
// Update
//

router.put('/update/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update(Object,req,res);
});

router.put('/find_one_and_update/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_one_and_update(Object,req,res);
});

router.put('/update_by_id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update_by_id(Object,req,res);
});

//
// Delete
//

router.delete('/delete/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(Object,req,res);
});

router.delete('/delete_by_id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete_by_id(Object,req,res);
});

module.exports = router;
