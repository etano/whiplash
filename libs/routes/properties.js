var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var Property = require(libs + 'schemas/property');

var log = require(libs + 'log')(module);

router.post('/commit/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(Property,req,res);
});

router.get('/query/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query(Property,req,res);
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.count(Property,req,res);
});

router.get('/query_for_ids/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryForIds(Property,req,res);
});

router.get('/query_by_ids/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryByIds(Property,req,res);
});

router.get('/query/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.queryById(Property,req,res);
});p

router.put('/update/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.findOneAndUpdate(Property,req,res);
});

router.put('/update/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.updateById(Property,req,res);
});

router.delete('/delete/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(Property,req,res);
});

router.delete('/delete/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.deleteById(Property,req,res);
});

router.put('/fetch_time_batch/', passport.authenticate('bearer', { session: false }), function(req, res) {

    var time_limit = req.body.time_limit

    var time = 0
    objs = {}

    while(time < time_limit){

        var update = {"status":1}
        var filter = {"owner":req.user,"status":0,"timeout":{"$lt":time_limit-time}};
        Property.findOneAndUpdate(filter, update, {new: true}, function (err, obj) {
            if(!obj)
                break;

            if (!err){
                objs.push(obj);
                time += obj['timeout']
            }
            else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });

    }

    return res.json({
        status: 'OK',
        objs: objs
    });    
});

module.exports = router;
