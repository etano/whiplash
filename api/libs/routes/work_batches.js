var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('work_batches');
var ObjType = require(libs + 'schemas/work_batch');

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
    common.query_count(collection,req,res);
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    collection.findOneAndDelete({owner:String(req.user._id)}, {projection: {ids: 1}}, function (err, result) {
        if (!err) {
            if(result.value){
                return res.json({
                    status: 'OK',
                    result: result.value.ids
                });
            } else {
                return res.json({
                    status: 'OK',
                    result: []
                });
            }
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

router.get('/fields/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_fields_only(collection,req,res);
});

module.exports = router;
