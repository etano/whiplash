var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('jobs');
var ObjType = require(libs + 'schemas/job');

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
            common.commit(collection,req,res);
        }
    });
});

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection,req,res);
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body;
    filter.owner = String(req.user._id);
    common.query_count(collection,filter,res);
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body;
    filter.owner = String(req.user._id);
    common.query(collection,filter,res);
});

router.get('/fields/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body.filter;
    filter.owner = String(req.user._id);
    var fields = req.body.fields;
    common.query_fields_only(collection,filter,fields,res);
});

router.get('/stats/', passport.authenticate('bearer', { session: false }), function(req, res) {
    //TODO: backend
    return res.json({
        status: 'OK',
        result: {
            count: 3,
            stats: [
                       { time: "14.06.2015 10:15", done: 13, togo: 0, now: 0 },
                       { time: "14.06.2015 9:15", done: 10, togo: 3, now: 1 },
                       { time: "14.06.2015 8:35", done: 10, togo: 2, now: 0 }
                   ] 
        }
    });
});

module.exports = router;
