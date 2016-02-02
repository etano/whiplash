var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('properties');
var ObjectID = require('mongodb').ObjectID;

//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(collection, common.get_payload(req,'objs'), String(req.user._id), res, common.return);
});

//
// Query
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(collection, common.get_payload(req,'filter'), common.get_payload(req,'fields'), String(req.user._id), res, common.return);
});

router.get('/id/:id/log', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(collection, {_id: new ObjectID(req.params.id)}, String(req.user._id), res, function(res, err, objs) {
        if (!err) {
            if (objs.length > 0) {
                return res.json({status: 'OK', result: objs[0]["log"]});
            } else {
                common.return(res, "Not found", 0);
            }
        } else {
            common.return(res, err, 0);
        }
    });
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.count(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

//
// Update
//

router.put('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update(collection, common.get_payload(req,'filter'), common.get_payload(req,'update'), String(req.user._id), res, common.return);
});

router.put('/replace/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.replace(collection, common.get_payload(req,'objs'), String(req.user._id), res, common.return);
});

router.put('/refresh/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.form_filter(collection, {"status":"timed out"}, String(req.user._id), function(filter){
        collection.find(filter).forEach(function(doc) {
            collection.updateOne({"_id":new ObjectID(doc._id)},{"$set":{"timeout":2*doc.timeout,"status":"unresolved"}});
        }, function(err) {
            if(!err) {
                common.return(res, 0, 'done');
            } else {
                common.return(res, err, 0);
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
