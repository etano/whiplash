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
    ObjType.collection.find(filter).limit(1000).toArray(function(err, objs) {
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
            //ObjType.update({'_id': {'$in': ids}}, update, {multi:true}, function(err) {console.log("Done");});
            ObjType.collection.updateMany({'_id': {'$in': ids}}, {'$set':update}, {w:1}, function (err, result) {});
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

router.get('/total/', passport.authenticate('bearer', { session: false }), function(req, res) {
    if (!req.query.field) {
        req.query.field = req.body.field;
        req.query.filter = req.body.filter;
    }
    var map = function () { emit(this.owner, this[field]); };
    var reduce = function (key, values) { return Array.sum(values); };
    req.query.filter.owner = String(req.user._id);
    var o = {query: req.query.filter, out: {merge:'total'}, scope: {field:req.query.field}};
    ObjType.collection.mapReduce(map, reduce, o, function (err, collection) {
        if(!err){
            collection.find().toArray(function (err, result) {
                return res.json({
                    status: 'OK',
                    result: result[0].value
                });
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

router.get('/average_mistime/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var map = function (){ emit(this.owner, {sum:this.timeout,count:this.walltime}); };
    var reduce = function (key, values)
    {
        var reduced_value = {sum : 0.0, count : values.length};
        for (var i = 0; i < values.length; i++) {
            reduced_value.sum += (values[i].sum - values[i].count)/values[i].count;
        }
        return reduced_value;
    };
    var o = {};
    o.query = {"status":3,"owner":String(req.user._id)};
    o.finalize = function (key, reduced_value)
    {
        return reduced_value.sum/reduced_value.count;
    };
    o.out = {merge:'average_mistime'};
    ObjType.collection.mapReduce(map, reduce, o, function (err, collection) {
        collection.find().toArray(function (err, result) {
            if(!err){
                return res.json({
                    status: 'OK',
                    result: result[0].value
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    });
});

module.exports = router;
