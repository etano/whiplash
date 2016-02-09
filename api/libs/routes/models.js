var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var log = require(libs + 'log')(module);
var db = require(libs + 'db/mongo');
var GridStore = require('mongodb').GridStore;
var collection = db.get().collection('models');

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
    var filter = common.get_payload(req,'filter');
    var fields = common.get_payload(req,'fields');
    common.query(collection, filter, fields, String(req.user._id), res, common.return);
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
                  emit(this.owner, {
                      sum: this[field],
                      max: this[field],
                      min: this[field],
                      count: 1,
                      diff: 0
                  });
              };
    common.stats(collection, common.get_payload(req,'filter'), common.get_payload(req,'field'), map, String(req.user._id), res, common.return);
});


router.get('/mapreduce/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.mapreduce(collection,req,res);
});


module.exports = router;
