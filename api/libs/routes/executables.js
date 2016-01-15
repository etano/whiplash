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
    common.commit(ObjType, collection, common.get_payload(req,'objs'), String(req.user._id), res, common.return);
});

//
// Query
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(collection, common.get_payload(req,'filter'), common.get_payload(req,'fields'), String(req.user._id), res, common.return);
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
    common.replace(ObjType, collection, common.get_payload(req,'objs'), common.get_payload(req,'fields'), String(req.user._id), res, common.return);
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
