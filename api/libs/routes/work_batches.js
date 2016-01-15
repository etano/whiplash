var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('work_batches');
var properties = db.get().collection('properties');
var ObjType = require(libs + 'schemas/work_batch');
var ObjectID = require('mongodb').ObjectID;

//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.commit(ObjType, collection, common.get_payload(req,'objs'), String(req.user._id), res, common.return);
});

//
// Query
//

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var user_id = String(req.user._id);
    common.pop(collection, {}, {timestamp: 1}, user_id, res, function (res, err, work_batch) {
        if (!err) {
            if (work_batch) {
                var property_ids = [];
                for (var i=0; i<work_batch['ids'].length; i++) {
                    property_ids.push(new ObjectID(work_batch['ids'][i]));
                }
                common.update(properties, {'_id':{'$in':property_ids}}, {'status':'running'}, user_id, res, function(res, err, count) {
                    if (!err) {
                        common.query(properties, {'_id':{'$in':property_ids}}, [], user_id, res, function(res, err, property_objs) {
                            if (!err) {
                                common.return(res, 0, property_objs);
                            } else {
                                common.return(res, err, 0);
                            }
                        });
                    } else {
                        common.return(res, err, 0);
                    }
                });
            } else {
                common.return(res, 0, []);
            }
        } else {
            common.return(res, err, 0);
        }
    });
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.count(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

//
// Delete
//

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection, common.get_payload(req,'filter'), String(req.user._id), res, common.return);
});

module.exports = router;
