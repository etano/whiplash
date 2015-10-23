var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var ObjType = require(libs + 'schemas/property');

//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(ObjType,req,res);
});

//
// Query
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(ObjType,req,res);
});

router.get('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_one(ObjType,req,res);
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_count(ObjType,req,res);
});

router.get('/field/:field', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_field_only(ObjType,req,res);
});

router.get('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_id(ObjType,req,res);
});

//
// Update
//

router.put('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update(ObjType,req,res);
});

router.put('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update_one(ObjType,req,res);
});

router.put('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update_id(ObjType,req,res);
});

//
// Delete
//

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(ObjType,req,res);
});

router.delete('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete_id(ObjType,req,res);
});

//
// Special
//

var log = require(libs + 'log')(module);

router.put('/work_batch/', passport.authenticate('bearer', { session: false }), function(req, res) {

    //TODO: make this more advanced at some point

    var num_properties = 100;
    var time_limit = req.body.time_limit;
    var now = new Date();
    var filter = {"status":"unresolved","timeout":{"$lt":time_limit}};
    var update = {"status":"pulled","consume_by":now.getSeconds() + time_limit};

    ObjType.find(filter).limit(num_properties).exec(function(err, objs) {

        var ids = [];
        for(var i=0; i<objs.length; i++) {
            ids.push(objs[i]["_id"]);
        }

        if (!err) {
            ObjType.update({'_id': {'$in': ids}}, update, {multi:true},function(err) {console.log("Done");});
            return res.json({
                status: 'OK',
                objs: objs
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

router.get('/total_time/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = {"status":"unresolved"};
    ObjType.find(filter, "timeout", function (err, timeouts) {
        var total_time = 0;
        for(var i=0; i<timeouts.length; i++) {
            total_time += timeouts[i].timeout;
        }
        if (!err) {
            return res.json({
                status: 'OK',
                total_time: total_time
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

module.exports = router;
