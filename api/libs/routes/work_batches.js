var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('work_batches');
var ObjType = require(libs + 'schemas/work_batch');
var ObjectID = require('mongodb').ObjectID;

//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(ObjType, collection, req.body, String(req.user._id), res, common.return);
});

//
// Query
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    collection.findOneAndDelete({owner:String(req.user._id)}, {sort: {timestamp: 1}, projection: {ids: 1}}, function (err, result) {
        if (!err) {
            if(result.value){
                for(var i=0;i<result.value.ids.length;i++){
                    result.value.ids[i] = new ObjectID(result.value.ids[i]);
                }
                db.get().collection('properties').updateMany({'_id':{'$in':result.value.ids}}, {'$set':{"status":"running"}}, {w:1}, function (err, result2) {
                    if (!err) {
                        log.info("%d properties are running",result2.modifiedCount);
                        return res.json({ status: 'OK', result: result.value.ids });
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s',res.statusCode,err.message);
                        return res.json({ error: 'Server error' });
                    }
                });
            } else {
                return res.json({ status: 'OK', result: [] });
            }
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_count(collection, req.body, String(req.user._id), res, common.return);
});

router.get('/fields/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_fields_only(collection, req.body.filter, req.body.fields, String(req.user._id), res, common.return);
});


//
// Delete
//

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection, req.body, String(req.user._id), res, common.return);
});

router.delete('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection, {"_id": new ObjectID(req.params.id)}, String(req.user._id), res, common.return);
});


module.exports = router;
