var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('jobs');
var ObjType = require(libs + 'schemas/job');

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
    var filter = req.body;
    filter.owner = String(req.user._id);
    common.query_count(collection,filter,res);
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body;
    filter.owner = String(req.user._id);
    common.query(collection,filter,res);
});

router.get('/fields/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body.filter;
    filter.owner = String(req.user._id);
    var fields = req.body.fields;
    common.query_fields_only(collection,filter,fields,res);
});

router.get('/stats/', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: backend
    return res.json({
        status: 'OK',
        result: {
            count: 3,
            stats: [
                       { time: "14.06.2015 10:15", done: 13, togo: 0, now: 0, batch_id: 0 },
                       { time: "14.06.2015 9:15",  done: 10, togo: 3, now: 1, batch_id: 1 },
                       { time: "14.06.2015 8:35",  done: 10, togo: 2, now: 0, batch_id: 2 }
                   ]
        }
    });
});

router.get('/:id/download', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: backend
    // Need to issue file transfer here
    return res.json({
        status: 'OK',
        result: {
            data: req.params.id
        }
    });
});

router.get('/:id/log', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: backend
    // Need to issue file transfer here
    return res.json({
        status: 'OK',
        result: {
            data: req.params.id
        }
    });
});

router.get('/:id/explore', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: backend
    return res.json({
        status: 'OK',
        result: {
            count: 3,
            runs: [
                       { id: 0, app: "xxx", model: "test", params: [ { name : "energy", value : "-5"  }, { name : "seed", value : "17" } ] },
                       { id: 1, app: "xxx", model: "test", params: [ { name : "energy", value : "-45" } ]                                  },
                       { id: 2, app: "xxx", model: "test", params: [ { name : "energy", value : "-7"  }, { name : "seed", value : "23" } ] }
                  ]
        }
    });
});

router.post('/compose', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: backend
    // Accepts list of params and their constraints from GUI. Returns batch id.
    //
    // Input example:
    //
    // { model : <model name>,
    //   container : <container name>,
    //   parameters : [
    //                  [ { attr : "name", value : "Energy" }, { attr : <constraint name>, value : <constraint value> } ],  // parameter 0
    //                  [ { attr : "name", value : "Seed"   }, { attr : <constraint name>, value : <constraint value> } ]   // parameter 1
    //                ]
    // }

    return res.json({
        status: 'OK',
        result: {
            batch_id: 1
        }
    });
});

router.post('/script', passport.authenticate('bearer', { session: false }), function(req, res) {
    // TODO: backend
    // Accepts the source code of a script

    return res.json({
        status: 'OK',
        result: {
            batch_id: 1
        }
    });
});

module.exports = router;
