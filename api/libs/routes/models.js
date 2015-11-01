var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var common = require(libs + 'routes/common');
var ObjType = require(libs + 'schemas/model');

var log = require(libs + 'log')(module);
var crypto = require('crypto');
function checksum (str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex');
}

//
// Commit
//

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    for(var i=0; i<req.body.length; i++) {
        req.body[i].md5 = checksum(JSON.stringify(req.body[i].content));
    }
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
// Find and update
//

router.post('/one/', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_one_and_update(ObjType,req,res);
});

router.post('/id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    common.find_id_and_update(ObjType,req,res);
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
// GridFS
//

var mongoose = require('mongoose');
var Grid = require("gridfs-stream"); Grid.mongo = mongoose.mongo;
var conn = require(libs + 'db/mongoose').connection;
var gridfs = Grid(conn.db);

router.post('/files/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var err = common.validate(ObjType,req);
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
    }
    else {
        for(var i=0; i<req.body.length; i++) {

            var metadata = req.body[i].tags;
            metadata.owner = String(req.user._id);
            metadata.property_id = req.body[i].property_id;
            
            var options = {
                metadata: metadata
            };

            var writeStream = gridfs.createWriteStream(options);

            var Readable = require('stream').Readable;

            var s = new Readable();
            s.push(JSON.stringify(req.body[i].content));
            s.push(null);
            s.pipe(writeStream);

            writeStream.on("close", function (file) {
                log.info("Wrote file: %s",file._id.toString());
                return res.json({
                    status: 'OK',
                    result: file._id.toString()
                });
            });

            writeStream.on('error', function (err) {
                log.error("Write error: %s",err.message);
                return res.json({ error: 'Server error' });;
            });
        }
    }
});

router.get('/file_id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {

    var readStream = gridfs.createReadStream({ _id: req.params.id });

    readStream.on("error", function(err) {
        log.error("Read error: %s",err.message);
        return res.json({ error: 'Server error' });
    });

    var buffer = "";
    readStream.on("data", function (chunk) {
        console.log("reading chunk:",chunk)
        buffer += chunk;
    });

    readStream.on("end", function () {
        log.info("Read file: %s",req.params.id);
        return res.json({
            status: 'OK',
            result: buffer
        });
    });
});

router.get('/tags/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = {}
    for(var key in req.body)
        if(req.body.hasOwnProperty(key))
            filter["metadata."+key] = req.body[key];

    gridfs.files.find(filter).toArray(function (err, files) {

        if(!files) {
            res.statusCode = 404;
            return res.json({ error: 'Not found' });
        }

        if (!err) {
            return res.json({
                status: 'OK',
                result: files
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }        
    });
});

router.delete('/file/:id', passport.authenticate('bearer', { session: false }), function(req, res) {

    var filter = {_id : req.params.id, owner : String(req.user._id)}

    gridfs.remove(filter, function (err) {
        if (!err) {
            return res.json({
                status: 'OK',
                result: 'file deleted'
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }        
    });

});

module.exports = router;
