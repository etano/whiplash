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

//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(ObjType, collection, req.body, String(req.user._id), res, common.return);
});

//
// Query
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(collection, req.body, String(req.user._id), res, common.return);
});

router.get('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_one(collection, req.body, String(req.user._id), res, common.return);
});

router.get('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_one(collection, {_id: new ObjectID(req.params.id)}, String(req.user._id), res, common.return);
});

router.get('/id/:id/log', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_one(collection, {_id: new ObjectID(req.params.id)}, String(req.user._id), res, function(res, err, obj) {
        if (!err) {
            return res.json({status: 'OK', result: obj["log"]});
        } else {
            return res.json({status: res.statusCode, error: JSON.stringify(err)});
        }
    });
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_count(collection, req.body, String(req.user._id), res, common.return);
});

router.get('/fields/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_fields_only(collection, req.body.filter, req.body.fields, String(req.user._id), res, common.return);
});

//
// Update
//

router.put('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update(collection, req.body.filter, req.body.update, String(req.user._id), res, common.return);
});

router.put('/replace', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.replace(ObjType, collection, req.body, String(req.user._id), res, common.return);
});

router.put('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_one_and_update(collection, req.body.filter, req.body.update, String(req.user._id), res, common.return);
});

router.put('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_one_and_update(collection, {"_id": new ObjectID(req.params.id)}, req.body.update, String(req.user._id), res, common.return);
});

//
// Delete
//

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection, req.body, String(req.user._id), res, common.return);
});

router.delete('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection, {"_id": new ObjectID(req.params.id)}, String(req.user._id), res, common.return);
});

//
// Map-reduce
//

router.get('/stats/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.stats(collection,req,res);
});

module.exports = router;
