var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('executables');
var ObjType = require(libs + 'schemas/executable');

//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.validate(ObjType,req,function(err){
        if(err) {
            if(err.name === 'ValidationError') {
                res.statusCode = 400;
                log.error('Validation error(%d): %s', res.statusCode, err.message);
                return res.json({ error: err.toString() });
            } else {
                res.statusCode = 500;
                log.error('Server error(%d): %s', res.statusCode, err.message);
                return res.json({ error: err.toString() });
            }
        }
        else {
            common.commit(collection,req,res);
        }
    });
});

//
// Query
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body;
    common.query(collection,filter,res);
});

router.get('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body;
    common.query_one(collection,filter,res);
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body;
    common.query_count(collection,filter,res);
});

router.get('/field/:field', passport.authenticate('bearer', { session: false }), function(req, res) {
    var field = req.params.field;
    var filter = req.body;
    common.query_field_only(collection,field,filter,res);
});

router.get('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = {_id:req.params.id};
    common.query_one(collection,filter,res);
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
// Update
//

router.put('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update(collection,req,res);
});

router.put('/batch', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.batch_update(collection,req,res);
});

router.put('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update_one(collection,req,res);
});

router.put('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update_id(collection,req,res);
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

router.get('/avg_per_dif/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.avg_per_dif(collection,req,res);
});

module.exports = router;
