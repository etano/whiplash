var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var Object = require(libs + 'schemas/property');

//
// Commit
//

router.post('/commit/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(Object,req,res);
});

//
// Query
//

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.count(Object,req,res);
});

router.get('/query/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(Object,req,res);
});

router.get('/query_for_ids/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_for_ids(Object,req,res);
});

router.get('/query_by_id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_by_id(Object,req,res);
});

//
// Update
//

router.put('/update/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update(Object,req,res);
});

router.put('/find_one_and_update/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_one_and_update(Object,req,res);
});

router.put('/update_by_id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update_by_id(Object,req,res);
});

//
// Delete
//

router.delete('/delete/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(Object,req,res);
});

router.delete('/delete_by_id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete_by_id(Object,req,res);
});

//
// Special
//

var log = require(libs + 'log')(module);

router.put('/fetch_work_batch/', passport.authenticate('bearer', { session: false }), function(req, res) {

    //TODO: make this more advanced at some point

    var num_jobs = 100;

    var time_limit = req.body.time_limit;
    //var time = 0;

    //var filter = {"status":"unresolved","timeout":{$lt:(time_limit-time)}};
    var filter = {"status":"unresolved","timeout":{$lt:time_limit}};

    //var update = {"status":"pulled","consume_by":Date.now + (time_limit-time)};
    var update = {"status":"pulled","consume_by":Date.now + time_limit};

    Object.findAndUpdate(filter, update, {new: true}, function (err, objs) {

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
