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
    common.commit(ObjType, collection, common.get_payload(req,'objs'), String(req.user._id), res, common.return);
});

//
// Query
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

router.get('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_one(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
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
    common.query_count(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

router.get('/fields/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_fields_only(collection, common.get_payload(req,'filter'), common.get_payload(req,'fields'), String(req.user._id), res, common.return);
});

//
// Update
//

router.put('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update(collection, common.get_payload(req,'filter'), common.get_payload(req,'update'), String(req.user._id), res, common.return);
});

router.put('/replace/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.replace(ObjType, collection, common.get_payload(req,'objs'), String(req.user._id), res, common.return);
});

router.put('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_one_and_update(collection, common.get_payload(req,'filter'), common.get_payload(req,'update'), String(req.user._id), res, common.return);
});

router.put('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_one_and_update(collection, {"_id": new ObjectID(req.params.id)}, common.get_payload(req,'update'), String(req.user._id), res, common.return);
});

router.put('/refresh/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.form_filter(collection, {"status":"timed out"}, String(req.user._id), function(filter){
        collection.find(filter).forEach(function(doc) {
            collection.updateOne({"_id":new ObjectID(doc._id)},{"$set":{"timeout":2*doc.timeout,"status":"unresolved"}});
        }, function(err) {
            if(!err) {
                log.info("Refreshed properties");
                return res.json({ status: 'OK', result: 'done' });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    });
});

//
// Delete
//

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

router.delete('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection, {"_id": new ObjectID(req.params.id)}, String(req.user._id), res, common.return);
});

//
// Map-reduce
//

router.get('/stats/', passport.authenticate('bearer', { session: false }), function(req, res) {
   var map = function () {
                 emit(this.owner,
                     {sum: this[field],
                      max: this[field],
                      min: this[field],
                      count: 1,
                      diff: 0
                     });
             };
   common.stats(collection,req,res,map);
});

router.get('/mapreduce/', passport.authenticate('bearer', { session: false }), function(req, res) {
   common.mapreduce(collection,req,res);
});

module.exports = router;
