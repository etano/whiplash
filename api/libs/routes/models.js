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

var conn = require(libs + 'db/mongoose').connection;
var GridStore = require('mongodb').GridStore;
var ObjectID = require('mongodb').ObjectID;

// var mongoose = require('mongoose');
// var Grid = require("gridfs-stream"); Grid.mongo = mongoose.mongo;
// var gridfs = Grid(conn.db);

router.post('/files/', passport.authenticate('bearer', { session: false }), function(req, res) {

    //TODO: dangling chunks

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
        }
        else {
            var ids = []; var count = 0;
            function write_file() {

                if(count < req.body.length){

                    var metadata = req.body[count].tags;
                    metadata.owner = req.body[count].owner;
                    metadata.property_id = req.body[count].property_id;
                    
                    var options = {
                        metadata: metadata
                    };
                    
                    //*********

                    var content = JSON.stringify(req.body[count].content);

                    count++;

                    var fileId = new ObjectID();

                    var gridStore = new GridStore(conn.db, fileId, 'w');

                    gridStore.open(function(err, gridStore) {
                        if(err){
                            log.error("Error opening file: %s",err.message);
                            write_file();
                        } else {
                            gridStore.write(content, function(err, gridStore) {
                                if(err){
                                    log.error("Error writing file: %s",err.message);
                                    write_file();
                                } else {
                                    gridStore.close(function(err, result) {
                                        if(err){
                                            log.error("Error closing file: %s",err.message);
                                        } else {
                                            log.info("Wrote file: %s",fileId.toString());
                                            ids.push(fileId.toString());
                                        }
                                        write_file();
                                    });
                                }
                            });
                        }
                    });

                    //*********

                    // var writeStream = gridfs.createWriteStream(options);

                    // var Readable = require('stream').Readable;

                    // var s = new Readable();
                    // s.push(JSON.stringify(req.body[count].content));
                    // s.push(null);
                    // s.pipe(writeStream);

                    // count++;

                    // writeStream.on("close", function (file) {
                    //     log.info("Wrote file: %s",file._id.toString());
                    //     ids.push(file._id.toString());
                    //     write_file();
                    // });

                    // writeStream.on('error', function (err) {
                    //     log.error("Write error: %s",err.message);
                    //     write_file();
                    // });

                    //*********

                } else {
                    return res.json({
                        status: 'OK',
                        result: ids
                    });        
                }
            }
            write_file();
        }
    });
});

router.get('/file_id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {

    GridStore.read(conn.db, new ObjectID(req.params.id), function(err, fileData) {
        if(!err) {
            log.info("Read file: %s",req.params.id);
            return res.json({
                status: 'OK',
                result: fileData.toString()
            });
        } else {
            log.error("Read error: %s",err.message);
            return res.json({ error: 'Server error' });
        }
    });

    //*********

    // var readStream = gridfs.createReadStream({ _id: req.params.id });

    // readStream.on("error", function(err) {
    //     log.error("Read error: %s",err.message);
    //     return res.json({ error: 'Server error' });
    // });

    // var buffer = "";
    // readStream.on("data", function (chunk) {
    //     console.log("reading chunk:",chunk)
    //     buffer += chunk;
    // });

    // readStream.on("end", function () {
    //     log.info("Read file: %s",req.params.id);
    //     return res.json({
    //         status: 'OK',
    //         result: buffer
    //     });
    // });
});

router.get('/tags/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var filter = {};
    for(var key in req.body)
        if(req.body.hasOwnProperty(key))
            filter["metadata."+key] = req.body[key];

    //gridfs.files.find(filter).toArray(function (err, files) {
    conn.db.collection('fs.files').find(filter).toArray(function (err, files) {

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

router.delete('/file_id/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    var gridStore = new GridStore(conn.db, new ObjectID(req.params.id), 'w');
    gridStore.open(function(err, gridStore) {

        if(err) {
            res.statusCode = 500;
            log.error('Error opening file (%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        } else if(gridStore.metadata.owner != req.user._id) {
            res.statusCode = 400;
            log.error('Wrong owner');
            return res.json({ error: 'You are not the owner of this file' });
        }
        else {
            gridStore.unlink(function(err, result) {
                if(!err){
                    return res.json({
                        status: 'OK',
                        result: 'file deleted'
                    });                    
                } else{
                    res.statusCode = 500;
                    log.error('Error deleting file (%d): %s',res.statusCode,err.message);
                    return res.json({ error: 'Server error' });
                }
            });
        }
    });

    //*********

    // var filter = {_id : req.params.id, "metadata.owner" : String(req.user._id)}        

    // gridfs.remove(filter, function (err) {
    //     if (!err) {
    //         return res.json({
    //             status: 'OK',
    //             result: 'file deleted'
    //         });
    //     } else {
    //         res.statusCode = 500;
    //         log.error('Internal error(%d): %s',res.statusCode,err.message);
    //         return res.json({ error: 'Server error' });
    //     }        
    // });

});

module.exports = router;
