var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('properties');
var ObjType = require(libs + 'schemas/property');

//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(ObjType,collection,req,res);
});

//
// Query
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(collection,req,res);
});

router.get('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_one(collection,req,res);
});

router.get('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_id(collection,req,res);
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_count(collection,req,res);
});

router.get('/fields/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_fields_only(collection,req,res);
});

//
// Update
//

router.put('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update(collection,req,res);
});

router.put('/replacement', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.replace_many(collection,req,res);
});

router.put('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update_one(collection,req,res);
});

router.put('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update_id(collection,req,res);
});

//
// Find and update
//

router.post('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_one_and_update(collection,req,res);
});

router.post('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_id_and_update(collection,req,res);
});

//
// Delete
//

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection,req,res);
});

router.delete('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete_id(collection,req,res);
});

//
// Map-reduce
//

router.get('/stats/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.stats(collection,req,res);
});

module.exports = router;
