var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
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

router.put('/batch', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.batch_update(ObjType,req,res);
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
// Map-reduce
//

router.get('/total/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.total(ObjType,req,res);
});

router.get('/avg_per_dif/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.avg_per_dif(ObjType,req,res);
});

//
// Special
//

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

module.exports = router;
