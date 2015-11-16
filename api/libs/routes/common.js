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
        if(req.body.length == 0) {
            return res.json({
                status: 'OK',
                result: {'n':0,'ids':[]}
            });
        } else {
            var batch = collection.initializeUnorderedBulkOp();
            for(var i=0; i<req.body.length; i++) {
                batch.insert(req.body[i]);
            }
            batch.execute(function(err,result) {
                if (result.ok) {
                    log.info("%s new objects created", String(result.nInserted));
                    return res.json({
                        status: 'OK',
                        result: {'n':result.nInserted,'ids':result.getInsertedIds()}
                    });
                } else {
                    res.statusCode = 500;
                    log.error('Write error: %s %s', err.message, result.getWriteErrors());
                    return res.json({ error: 'Server error' });
                }
            });
        }
    },

    //
    // Query
    //

    query: function(collection,filter,res) {
        if(!filter.hasOwnProperty('metadata')){
            filter.owner = String(req.user._id);
        }
        collection.find(filter).toArray(function (err, objs) {
            // Check exists
            if(!objs) {
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }

            // Return object
            if (!err) {
                log.info("Query objects in %s",collection.collectionName);
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
        if(!filter.hasOwnProperty('metadata')){
            filter.owner = String(req.user._id);
        }
        collection.find(filter).limit(1).toArray(function (err, obj) {
            // Check exists
            if(!obj) {
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }

            // Return object
            if (!err) {
                log.info("Query single object in %s",collection.collectionName);
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
        if(!filter.hasOwnProperty('metadata')){
            filter.owner = String(req.user._id);
        }
        collection.count(filter, function (err, count) {

            // Return object
            if (!err) {
                log.info("Counting %d objects in %s",count,collection.collectionName);
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

    query_fields_only: function(collection,filter,fields,res) {
        var proj = {};
        for(var i=0; i<fields.length; i++){
            proj[fields[i]] = 1;
        }
        if(!filter.hasOwnProperty('metadata')){
            filter.owner = String(req.user._id);
        }
        collection.find(filter).project(proj).toArray(function (err, objs) {
            // Check exists
            if(!objs) {
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }

            var fields1 = [];
            for(var j=0; j<fields.length; j++){
                if(~fields[j].indexOf('metadata.'))
                    fields1.push(fields[j].split('.')[1]);
                else
                    fields1.push(fields[j]);
            }
            var projection = {};
            for(var j=0; j<fields1.length; j++){
                projection[fields1[j]] = [];
            }
            for(var i=0; i<objs.length; i++) {
                for(var j=0; j<fields1.length; j++){
                    if(fields1[j] == fields[j])
                        projection[fields1[j]].push(objs[i][fields[j]]);
                    else
                        projection[fields1[j]].push(objs[i]['metadata'][fields1[j]]);
                }
            }

            // Return object
            if (!err) {
                log.info("Querying fields in %s",collection.collectionName);
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
                log.info("Found and updated object in %s",collection.collectionName);
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
        var filter = {"_id": req.params.id};
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
                log.info("%d objects updated",result.modifiedCount);
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
            arr.push({ replaceOne: { filter: {_id:req.body[i]._id,owner:String(req.user._id)}, replacement: req.body[i]}});
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
                log.info("Deleting %d objects",result.deletedCount);
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

    stats: function(collection,req,res) {
        if (!req.query.field) {
            req.query.field = req.body.field;
            req.query.filter = req.body.filter;
        }
        var map = function () {
            emit(this.owner,
                 {sum: this[field],
                  max: this[field],
                  min: this[field],
                  count: 1,
                  diff: 0
                 });
        };
        var reduce = function (key, values) {
            var a = values[0];
            for (var i=1; i < values.length; i++){
                var b = values[i];
                var delta = a.sum/a.count - b.sum/b.count;
                var weight = (a.count * b.count)/(a.count + b.count);
                a.diff += b.diff + delta*delta*weight;
                a.sum += b.sum;
                a.count += b.count;
                a.min = Math.min(a.min, b.min);
                a.max = Math.max(a.max, b.max);
            }
            return a;
        };
        var finalize = function (key, value)
        {
            value.mean = value.sum / value.count;
            value.variance = value.diff / value.count;
            value.stddev = Math.sqrt(value.variance);
            return value;
        };
        var o = {};
        o.finalize = finalize;
        req.query.filter.owner = String(req.user._id);
        o.scope = {field: req.query.field};
        o.query = req.query.filter;
        o.out = {replace: 'statistics' + '_' + req.query.field + '_' + collection.collectionName};
        collection.mapReduce(map, reduce, o, function (err, out_collection) {
            if(!err){
                out_collection.find().toArray(function (err, result) {
                    if(!err) {
                        log.info("Computing statistics for %s",req.query.field);
                        if(result.length>0) {
                            return res.json({
                                status: 'OK',
                                result: result[0].value
                            });
                        } else {
                            return res.json({
                                status: 'OK',
                                result: {'count':0}
                            });
                        }
                    } else {
                        res.statusCode = 500;
                        log.error('Internal error(%d): %s',res.statusCode,err.message);
                        return res.json({ error: 'Server error' });
                    }
                });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    }

};
