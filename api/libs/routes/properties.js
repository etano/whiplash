var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('properties');
var ObjType = require(libs + 'schemas/property');
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
    common.query(collection, req.body, String(req.user._id), res, common.return);
});

router.get('/search/', passport.authenticate('bearer', { session: false }), function(req, res) {

    common.form_filter(collection,{'status':"resolved"},String(req.user._id), function(filter){
        collection.find(filter).toArray(function (err, objs) {
            var runs = [];
            for(var i = 0; i < objs.length; i++) {
                var run = {};

                run.id = objs[i]._id;
                run.app = objs[i].executable_id;
                run.model = objs[i].input_model_id;

                var params = [];
                for(var key in objs[i].params)
                    params.push({'name' : key, 'value' : objs[i].params[key]});
                run.params = params;

                runs.push(run);
            }

            return res.json({
                status: 'OK',
                result: {
                    count: runs.length,
                    runs: runs
                }
            });
        });
    });
});

router.get('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_one(collection, req.body, String(req.user._id), res, common.return);
});

router.get('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_one(collection, {_id: new ObjectID(req.params.id)}, String(req.user._id), res, common.return);
});

router.get('/id/:id/log', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.query_one(collection, {_id: new ObjectID(req.params.id)}, String(req.user._id), res, function(res, err, obj) {
        if (!err) {
            return res.json({status: 'OK', result: obj["log"]});
        } else {
            return res.json({status: res.statusCode, error: JSON.stringify(err)});
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
// Update
//

router.put('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.update(collection, req.body.filter, req.body.update, String(req.user._id), res, common.return);
});

router.put('/replace/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.replace(ObjType, collection, req.body, String(req.user._id), res, common.return);
});

router.put('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_one_and_update(collection, req.body.filter, req.body.update, String(req.user._id), res, common.return);
});

router.put('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_one_and_update(collection, {"_id": new ObjectID(req.params.id)}, req.body.update, String(req.user._id), res, common.return);
});

router.put('/refresh/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.form_filter(collection,{"status":"timed out"},String(req.user._id), function(filter){
        collection.find(filter).forEach(function(doc) {
            collection.updateOne({"_id":new ObjectID(doc._id)},{"$set":{"timeout":2*doc.timeout,"status":"unresolved"}});
        }, function(err) {
            if(!err) {
                log.info("Refreshed properties");
                return res.json({ status: 'OK', result: 'done' });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    });
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

//
// Map-reduce
//

router.get('/stats/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.stats(collection,req,res);
});

module.exports = router;
