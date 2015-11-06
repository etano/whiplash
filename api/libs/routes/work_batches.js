var express = require('express');
var passport = require('passport');
var router = express.Router();
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var collection = db.get().collection('work_batches');

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    for(var i=0; i<req.body.length; i++) {
        req.body[i].owner = String(req.user._id);
    }
    common.commit(collection,req,res);
});

router.delete('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.delete(collection,req,res);
});

router.get('/count/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = req.body;
    common.query_count(collection,filter,res);
});

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    collection.findOneAndDelete({owner:String(req.user._id)}, {projection: {ids: 1}}, function (err, result) {
        console.log(result)
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

module.exports = router;
