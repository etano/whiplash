var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var Object = require(libs + 'schemas/property');

router.post('/commit/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(Object,req,res);
});

router.get('/query/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(Object,req,res);
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.count(Object,req,res);
});

router.get('/query_for_ids/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryForIds(Object,req,res);
});

router.get('/query_by_ids/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryByIds(Object,req,res);
});

router.get('/query/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryById(Object,req,res);
});

router.put('/update/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.findOneAndUpdate(Object,req,res);
});

router.put('/update/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.updateById(Object,req,res);
});

router.delete('/delete/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(Object,req,res);
});

router.delete('/delete/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.deleteById(Object,req,res);
});

var log = require(libs + 'log')(module);

router.put('/fetch_work_batch/', passport.authenticate('bearer', { session: false }), function(req, res) {

    //TODO: make this more advanced at some point

    var num_jobs = 100;

    var time_limit = req.body.time_limit;
    //var time = 0;

    var update = {"status":1,"consume_by":Date.now + (time_limit-time)}
    //var filter = {"status":0,"timeout":{$lt:(time_limit-time)}};
    var filter = {"status":0,"timeout":{$lt:time_limit}};
    Object.find(filter, update, {new: true}, function (err, objs) {

        if (!err){
            return res.json({
                status: 'OK',
                objs: objs
            });    
        }
        else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }

    }).limit(num_jobs);//.sort({"timeout":-1});

    //time += obj['timeout'];
});

module.exports = router;
