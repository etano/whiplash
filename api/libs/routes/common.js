var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

module.exports = {

    //
    // Commit
    //

    commit: function(ObjType,req,res) {
        // Validate
        for(var i=0; i<req.body.length; i++) {
            req.body[i].owner = String(req.user._id);
            var obj = new ObjType(req.body[i]);
            var err = obj.validateSync();
            if (!err) {
                obj = obj.toObject();
                for(var field in obj) {
                    req.body[i][field] = obj[field];
                }
            } else {
                if(err.name === 'ValidationError') {
                    res.statusCode = 400;
                    res.json({ error: err.toString() });
                } else {
                    res.statusCode = 500;
                    res.json({ error: 'Server error' });
                }
                log.error('Internal error(%d): %s', res.statusCode, err.message);
                return;
            }
        }
        // Insert
        var batch = ObjType.collection.initializeUnorderedBulkOp();
        for(i=0; i<req.body.length; i++) {
            batch.insert(req.body[i]);
        }
        batch.execute(function(err,result) {
            if (result.ok) {
                log.info("%s new objects created", String(result.nInserted));
                log.error('Write errors: %s', result.getWriteErrors().toString());
                return res.json({
                    status: 'OK',
                    count: result.nInserted
                });
            } else {
                log.error('Write error: %s %s', err.message, result.getWriteErrors());
                return;
            }
        });
    },

    //
    // Query
    //

    query: function(ObjType,req,res) {
        ObjType.collection.find(req.body).toArray(function (err, objs) {
            // Check exists
            if(!objs) {
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }

            // TODO: Check to make sure user has READ permissions

            // Return object
            if (!err) {
                return res.json({
                    status: 'OK',
                    objs: objs
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    query_one: function(ObjType,req,res) {
        ObjType.collection.findOne(req.body).toArray(function (err, obj) {
            // Check exists
            if(!obj) {
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }

            // TODO: Check to make sure user has READ permissions

            // Return object
            if (!err) {
                return res.json({
                    status: 'OK',
                    obj: obj
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    query_count: function(ObjType,req,res) {
        ObjType.collection.count(req.body, function (err, count) {

            // TODO: Check to make sure user has READ permissions

            // Return object
            if (!err) {
                return res.json({
                    status: 'OK',
                    count: count
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    query_field_only: function(ObjType,req,res) {
        var proj = {};
        proj[req.params.field] = 1;
        ObjType.collection.find(req.body).project(proj).toArray(function (err, objs) {
            // Check exists
            if(!objs) {
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }

            // TODO: Check to make sure user has READ permissions
            var projection = [];
            for(var i=0; i<objs.length; i++) {
                projection.push(objs[i][req.params.field]);
            }

            // Return object
            if (!err) {
                return res.json({
                    status: 'OK',
                    objs: projection
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    query_id: function(ObjType,req,res) {
        ObjType.collection.findOne({_id:req.params.id}, function (err, obj) {
            // Check exists
            if(!obj) {
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }

            // TODO: Check to make sure user has READ permissions

            // Return object
            if (!err) {
                return res.json({
                    status: 'OK',
                    obj: obj
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    //
    // Find and update
    //

    find_one_and_update: function(ObjType,req,res) {
        req.body.filter.owner = String(req.user._id);
        ObjType.collection.findOneAndUpdate(req.body.filter, req.body.update, {w:1}, function (err, result) {
            if (!err) {
                return res.json({
                    status: 'OK',
                    obj: result.value
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    find_id_and_update: function(ObjType,req,res) {
        var filter = {"_id": req.params.id,"owner":String(req.user._id)};
        req.body.filter = filter;
        return this.find_one_and_update(ObjType,req,res);
    },

    //
    // Update
    //

    update: function(ObjType,req,res) {
        req.body.filter.owner = String(req.user._id);
        ObjType.collection.updateMany(req.body.filter, req.body.update, {w:1}, function (err, result) {
            if (!err) {
                return res.json({
                    status: 'OK',
                    count: result.modifiedCount // Other options include matchedCount and upsertedCount
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    update_one: function(ObjType,req,res) {
        return this.update(ObjType,req,res);
    },

    update_id: function(ObjType,req,res) {
        var filter = {"_id": req.params.id};
        req.body.filter = filter;
        return this.update_one(ObjType,req,res);
    },

    //
    // Delete
    //

    delete: function(ObjType,req,res) {
        var filter = req.body;

        // Enforce user can only delete own documents
        filter.owner = String(req.user._id);

        // Do delete operation
        ObjType.collection.deleteMany(filter, {}, function (err, result) {
            if (!err) {
                return res.json({
                    status: 'OK',
                    count: result.deletedCount
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    delete_id: function(ObjType,req,res) {
        req.body = {"_id": req.params.id};
        this.delete(ObjType,req,res);
    },

};
