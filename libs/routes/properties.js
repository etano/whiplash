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

    var num_jobs = 10;

    var time_limit = req.body.time_limit;
    //var time = 0;

    //var filter = {"status":"unresolved","timeout":{"$lt":(time_limit-time)}};
    var filter = {"status":"unresolved","timeout":{"$lt":time_limit}};

    //var update = {"status":"pulled","consume_by":Date.now + (time_limit-time)};
    //var update = {"status":"pulled","consume_by":Date.now + time_limit};
    var update = {"status":"pulled","consume_by":0}; //WARNING

    // ObjType.find(filter, function (err, objs) {
    //     // Check exists
    //     if(!objs) {
    //         res.statusCode = 404;
    //         return res.json({ error: 'Not found' });
    //     }

    //     // TODO: Check to make sure user has READ permissions

    //     // Return object
    //     if (!err) {
    //         return res.json({
    //             status: 'OK',
    //             objs: objs
    //         });
    //     } else {
    //         res.statusCode = 500;
    //         log.error('Internal error(%d): %s',res.statusCode,err.message);
    //         return res.json({ error: 'Server error' });
    //     }
    // });

    ObjType.find(filter).limit(num_jobs).exec(function (err, objs) {

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

    });

    // ObjType.find(filter).limit(num_jobs).update(update).exec(function (err, objs) {

    //     if (!err){
    //         return res.json({
    //             status: 'OK',
    //             objs: objs
    //         });    
    //     }
    //     else {
    //         res.statusCode = 500;
    //         log.error('Internal error(%d): %s',res.statusCode,err.message);
    //         return res.json({ error: 'Server error' });
    //     }

    // });

    //.sort({"timeout":-1});

    //time += obj['timeout'];
});

module.exports = router;
