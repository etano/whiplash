var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('properties');
var ObjType = require(libs + 'schemas/property');
var ObjectID = require('mongodb').ObjectID;

var crypto = require('crypto');
function checksum (str) {return crypto.createHash('md5').update(str, 'utf8').digest('hex');}

//TODO: string instead of integer for status

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
        } else {
            for(var i=0; i<req.body.length; i++) {
                req.body[i]['params_md5'] = checksum(JSON.stringify(req.body[i].params));
            }
            common.commit(collection,req,res);
        }
    });
});

//
// Query
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body;
    filter.owner = String(req.user._id);
    common.query(collection,filter,res);
});

router.get('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body;
    filter.owner = String(req.user._id);
    common.query_one(collection,filter,res);
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body;
    filter.owner = String(req.user._id);
    common.query_count(collection,filter,res);
});

router.get('/fields/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body.filter;
    filter.owner = String(req.user._id);
    var fields = req.body.fields;
    common.query_fields_only(collection,filter,fields,res);
});

router.get('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = {_id: new ObjectID(req.params.id)};
    filter.owner = String(req.user._id);
    common.query_one(collection,filter,res);
});

//
// Update
//

router.put('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update(collection,req,res);
});

router.put('/batch_replacement', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.batch_replace(collection,req,res);
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
