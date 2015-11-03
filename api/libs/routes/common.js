var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

module.exports = {

    //
    // Validate
    //

    validate: function(ObjType,req,cb) {
        for(var i=0; i<req.body.length; i++) {
            req.body[i].owner = String(req.user._id);
            var obj = new ObjType(req.body[i]);
            var err = obj.validateSync();
            if (!err) {
                req.body[i]._id = obj.id; // convert object id to string
                obj = obj.toObject();
                for(var field in obj) {
                    if (!req.body[i].hasOwnProperty(field)){
                        req.body[i][field] = obj[field];
                    }
                }
            } else {
                cb(err);
            }
        }
        cb(null);
    },

    //
    // Commit
    //

    commit: function(collection,req,res) {
        var batch = collection.initializeOrderedBulkOp();
        for(var i=0; i<req.body.length; i++) {
            batch.insert(req.body[i]);
        }
        batch.execute(function(err,result) {
            if (result.ok) {
                log.info("%s new objects created", String(result.nInserted));
                if (result.nInserted > 0) {
                    return res.json({
                        status: 'OK',
                        result: {'n':result.nInserted,'ids':result.getInsertedIds()}
                    });
                } else {
                    return res.json({
                        status: 'OK',
                        result: {'n':result.nInserted,'ids':[]}
                    });
                }
            } else {
                res.statusCode = 500;
                log.error('Write error: %s %s', err.message, result.getWriteErrors());
                return res.json({ error: 'Server error' });
            }
        });
    },

    //
    // Query
    //

    query: function(collection,filter,res) {
        collection.find(filter).toArray(function (err, objs) {
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
                    result: objs
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    query_one: function(collection,filter,res) {
        collection.find(filter).limit(1).toArray(function (err, obj) {
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
                    result: obj
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    query_count: function(collection,filter,res) {
        collection.count(filter, function (err, count) {

            // TODO: Check to make sure user has READ permissions

            // Return object
            if (!err) {
                return res.json({
                    status: 'OK',
                    result: count
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    query_field_only: function(collection,field,filter,res) {
        var proj = {};
        proj[field] = 1;
        collection.find(filter).project(proj).toArray(function (err, objs) {
            // Check exists
            if(!objs) {
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }

            // TODO: Check to make sure user has READ permissions
            var projection = [];
            for(var i=0; i<objs.length; i++) {
                projection.push(objs[i][field]);
            }

            // Return object
            if (!err) {
                return res.json({
                    status: 'OK',
                    result: projection
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

    find_one_and_update: function(collection,req,res) {
        req.body.filter.owner = String(req.user._id);
        collection.findOneAndUpdate(req.body.filter, req.body.update, {w:1}, function (err, result) {
            if (!err) {
                return res.json({
                    status: 'OK',
                    result: result.value
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    find_id_and_update: function(collection,req,res) {
        var filter = {"_id": req.params.id,"owner":String(req.user._id)};
        req.body.filter = filter;
        return this.find_one_and_update(collection,req,res);
    },

    //
    // Update
    //

    update: function(collection,req,res) {
        req.body.filter.owner = String(req.user._id);
        collection.updateMany(req.body.filter, {'$set':req.body.update}, {w:1}, function (err, result) {
            if (!err) {
                return res.json({
                    status: 'OK',
                    result: result.modifiedCount // Other options include matchedCount and upsertedCount
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    batch_update: function(collection,req,res) {
        var arr = [];
        for(var i=0; i<req.body.length; i++) {
            arr.push({ replaceOne: { filter: {_id:req.body[i]._id}, replacement: req.body[i]}});
        }
        collection.bulkWrite(arr,{w:1},function(err,result) {
            if (result.ok) {
                log.info("%s new objects replaced", String(result.modifiedCount));
                return res.json({
                    status: 'OK',
                    result: result.modifiedCount
                });
            } else {
                res.statusCode = 500;
                log.error('Write error: %s %s', err.message, result.getWriteErrors());
                return res.json({ error: 'Server error' });;
            }
        });
    },

    update_one: function(collection,req,res) {
        return this.update(collection,req,res);
    },

    update_id: function(collection,req,res) {
        var filter = {"_id": req.params.id};
        req.body.filter = filter;
        return this.update_one(collection,req,res);
    },

    //
    // Delete
    //

    delete: function(collection,req,res) {
        var filter = req.body;

        // Enforce user can only delete own documents
        filter.owner = String(req.user._id);

        // Do delete operation
        collection.deleteMany(filter, {}, function (err, result) {
            if (!err) {
                return res.json({
                    status: 'OK',
                    result: result.deletedCount
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    delete_id: function(collection,req,res) {
        req.body = {"_id": req.params.id};
        this.delete(collection,req,res);
    },

    //
    // Map-reduce
    //

    total: function(collection,req,res,cb) {
        if (!req.query.field) {
            req.query.field = req.body.field;
            req.query.filter = req.body.filter;
        }
        var map = function () { emit(this.owner, this[field]); };
        var reduce = function (key, values) { return Array.sum(values); };
        req.query.filter.owner = String(req.user._id);
        var o = {};
        o.query = req.query.filter;
        o.out = {merge:'total'};
        o.scope = {field: req.query.field};
        collection.mapReduce(map, reduce, o, function (err, collection) {
            if(!err){
                collection.find().toArray(function (err, result) {
                    if(result.length>0) {
                        return res.json({
                            status: 'OK',
                            result: result[0].value
                        });
                    } else {
                        return res.json({
                            status: 'OK',
                            result: 0
                        });
                    }
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    avg_per_dif: function(collection,req,res) {
        if (!req.query.field1) {
            req.query.field1 = req.body.field1;
            req.query.field2 = req.body.field2;
            req.query.filter = req.body.filter;
        }
        var map = function (){ emit(this.owner, {avg:(this[field1] - this[field2])/this[field2],count:1}); };
        var reduce = function (key, values)
        {
            var reduced_value = {avg : 0.0, count : 0};
            for (var i = 0; i < values.length; i++) {
                reduced_value.avg += values[i].avg;
                reduced_value.count += values[i].count;
            }
            return reduced_value;
        };
        var o = {};
        req.query.filter.owner = String(req.user._id);
        o.scope = {field1: req.query.field1, field2: req.query.field2};
        o.query = req.query.filter;
        o.finalize = function (key, reduced_value)
        {
            return reduced_value.avg/reduced_value.count;
        };
        o.out = {merge:'average_mistime'};
        collection.mapReduce(map, reduce, o, function (err, collection) {
            collection.find().toArray(function (err, result) {
                if(!err){
                    if (result.length > 0) {
                        return res.json({
                            status: 'OK',
                            result: result[0].value
                        });
                    } else {
                        return res.json({
                            status: 'OK',
                            result: 0
                        });
                    }
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    return res.json({ error: 'Server error' });
                }
            });
        });
    },

};
