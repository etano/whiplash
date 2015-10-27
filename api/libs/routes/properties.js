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

    for(var i=0; i<req.body.length; i++)
        if(!("status" in req.body[i]))
            req.body[i].status = 0;

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
// Find and update
//

router.post('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_one_and_update(ObjType,req,res);
});

router.post('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_id_and_update(ObjType,req,res);
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
    var time_limit = req.body.time_limit;
    var filter = {"status":0,"timeout":{"$lt":time_limit}};
    ObjType.find(filter).limit(1000).exec(function(err, objs) {
        var time_left = time_limit;
        var ids = [];
        var work = [];
        for(var i=0; i<objs.length; i++) {
            var timeout = objs[i]["timeout"];
            if(timeout < time_left){
                time_left -= timeout;
                ids.push(objs[i]["_id"]);
                work.push(objs[i]);
            }
        }
        if (!err) {
            var now = new Date();
            var resolve_by = time_limit + Math.ceil(now.getTime()/1000);
            var update = {"status":1,"resolve_by":resolve_by};
            ObjType.update({'_id': {'$in': ids}}, update, {multi:true}, function(err) {console.log("Done");});
            return res.json({
                status: 'OK',
                objs: work
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

router.get('/total_time/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = {"status":0};
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

router.get('/unresolved_time/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var o = {};
    o.query = {"status":0};
    o.map = function () { emit(this.owner, this.timeout); };
    o.reduce = function (key, values) { return Array.sum(values);};
    o.out = {merge:'unresolved_time'};
    ObjType.mapReduce(o, function (err, model, stats) {
        console.log('map reduce took %d ms', stats.processtime);
        model.find().exec(function (err, result) {
            return res.json({
                status: 'OK',
                result: result
            });
        });
    });
});

router.get('/average_fuckup/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var o = {};
    o.query = {"status":3};
    o.map = function (){ emit(this.owner, {sum:this.timeout,count:this.walltime}); };
    o.reduce = function (key, values)
    {
        var reduced_value = {sum : 0.0, count : values.length};
        for (var i = 0; i < values.length; i++) {
            reduced_value.sum += (values[i].sum - values[i].count)/values[i].count;
        }
        return reduced_value;
    };
    o.finalize = function (key, reduced_value)
    {
        return reduced_value.sum/reduced_value.count;
    };
    o.out = {merge:'average_fuckup'};
    ObjType.mapReduce(o, function (err, model, stats) {
        console.log('map reduce took %d ms', stats.processtime);
        model.find().exec(function (err, result) {
            return res.json({
                status: 'OK',
                result: result
            });
        });
    });
});

module.exports = router;
