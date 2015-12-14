var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var ObjectID = require('mongodb').ObjectID;
var db = require(libs + 'db/mongo');

var crypto = require('crypto');
function checksum (str) {return crypto.createHash('md5').update(str, 'utf8').digest('hex');}

module.exports = {

    form_filter: function(collection,filter,user_id,cb) {
        // Regularize ids
        if ('_id' in filter) {
            if (typeof(filter['_id']) === 'object') {
                if ('$in' in filter['_id']) {
                    for (var i=0; i<filter['_id']['$in'].length; i++) {
                        filter['_id']['$in'][i] = new ObjectID(filter['_id']['$in'][i]);
                    }
                }
            } else {
                filter['_id'] = new ObjectID(filter['_id']);
            }
        }

        // Set permissions
        if (!('collaboration' in filter)) {
            db.get().collection('collaborations').find({"users":user_id}).project({"_id":1}).toArray(function (err, objs) {
                db.get().collection('users').find({"_id":new ObjectID(user_id)}).limit(1).project({"username":1}).toArray(function (err2, objs2) {
                    if(objs2) {
                        if(objs2[0]['username'] !== "scheduler") { // scheduler is god
                            if(!err) {
                                var ids = [];
                                for(var i=0; i<objs.length; i++) {
                                    ids.push(objs[i]['_id']);
                                }
                                if (ids.length > 0) {
                                    filter['$or'] = {'owner': user_id, 'collaboration': {'$in': ids}};
                                } else {
                                    filter.owner = user_id;
                                }
                            } else {
                                filter.owner = user_id;
                            }
                        }
                    }

                    // Prepend metadata for models
                    if (collection.collectionName === "fs.files") {
                        var new_filter = {};
                        for(var key in filter) {
                            if(key !== '_id') {
                                if(filter.hasOwnProperty(key)) {
                                    new_filter["metadata."+key] = filter[key];
                                }
                            } else {
                                new_filter['_id'] = filter[key];
                            }
                        }
                        filter = new_filter;
                    }

                    // Callback with filter
                    cb(filter);
                });
            });
        }
    },

    //
    // Validate
    //

    validate: function(ObjType,req,cb) {
        for(var i=0; i<req.body.length; i++) {
            req.body[i].owner = String(req.user._id);
            var obj = new ObjType(req.body[i]);
            var err = obj.validateSync();
            if (!err) {
                obj = obj.toObject();
                delete req.body[i]['_id'];
                for(var field in obj) {
                    if (!req.body[i].hasOwnProperty(field) && field != '_id'){
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
    // Query
    //

    query: function(collection,req,res) {
        this.form_filter(collection,req.body,String(req.user._id), function(filter) {
            collection.find(filter).toArray(function (err, objs) {
                if(!objs) {
                    res.statusCode = 404;
                    return res.json({ error: 'Not found' });
                }
                if (!err) {
                    log.info("Found %d objects in %s",objs.length,collection.collectionName);
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
        });
    },

    query_one: function(collection,req,res) {
        this.form_filter(collection,req.body,String(req.user._id), function(filter) {
            collection.find(filter).limit(1).toArray(function (err, obj) {
                if(!obj) {
                    res.statusCode = 404;
                    return res.json({ error: 'Not found' });
                }
                if (!err) {
                    log.info("Query single object in %s",collection.collectionName);
                    return res.json({
                        status: 'OK',
                        result: obj[0]
                    });
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    return res.json({ error: 'Server error' });
                }
            });
        });
    },

    query_id: function(collection,req,res) {
        req.body = {_id: new ObjectID(req.params.id)};
        return this.query_one(collection,req,res);
    },

    query_count: function(collection,req,res) {
        this.form_filter(collection,req.body,String(req.user._id), function(filter) {
            collection.count(filter, function (err, count) {
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
        });
    },

    query_fields_only: function(collection,req,res) {
        this.form_filter(collection,req.body.filter,String(req.user._id), function(filter) {
            var fields = req.body.fields;
            var proj = {};
            for(var i=0; i<fields.length; i++){
                proj[fields[i]] = 1;
            }
            collection.find(filter).project(proj).toArray(function (err, objs) {
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
        });
    },

    //
    // Commit
    //

    commit: function(ObjType,collection,req,res) {
       this.validate(ObjType,req, function(err) {
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
               if(req.body.length === 0) {
                   return res.json({
                       status: 'OK',
                       result: []
                   });
               } else {
                   var batch = [];
                   var unix_time = String(Math.round(new Date().getTime() / 1000));
                   var commit_tag = String(req.body[0].owner) + unix_time;
                   for(var i=0; i<req.body.length; i++) {
                       var fields = [];
                       if (collection.collectionName === "properties") {
                           req.body[i]['md5'] = checksum(JSON.stringify(req.body[i].params));
                           fields = ['input_model_id','executable_id','md5','owner','collaboration'];
                       }
                       else if (collection.collectionName === "executables") {
                           fields = ['name','algorithm','version','build','owner','collaboration'];
                       }
                       else if (collection.collectionName === "work_batches") {
                           fields = ['ids','owner','collaboration'];
                       }
                       else if (collection.collectionName === "jobs") {
                           req.body[i]['md5'] = checksum(JSON.stringify(req.body[i].ids));
                           fields = ['name','ids','owner','md5','collaboration'];
                       }
                       var filter = {};
                       for (var j = 0; j < fields.length; j++) {
                           if(req.body[i][fields[j]]) {
                               filter[fields[j]] = req.body[i][fields[j]];
                            }
                       }
                       req.body[i]['commit_tag'] = commit_tag;
                       batch.push({ updateOne: { filter: filter, update: req.body[i], upsert: true }});
                   }
                   collection.bulkWrite(batch,{w:1},function(err,result) {
                       if (result.ok) {
                           log.info("%s objects modified", String(result.modifiedCount));
                           var tag_filter = {'commit_tag':commit_tag};
                           var fields = ['_id'];
                           //TODO: just use this, but for some reason isn't a function
                           //return this.query_fields_only(collection,tag_filter,fields,res);
                           var proj = {};
                           for(var i=0; i<fields.length; i++){
                               proj[fields[i]] = 1;
                           }
                           collection.find(tag_filter).project(proj).toArray(function (err, objs) {
                               if(!objs) {
                                   res.statusCode = 404;
                                   return res.json({ error: 'Not found' });
                               }
                               var fields1 = [];
                               for(var j=0; j<fields.length; j++){
                                   fields1.push(fields[j]);
                               }
                               var projection = {};
                               for(var j=0; j<fields1.length; j++){
                                   projection[fields1[j]] = [];
                               }
                               for(var i=0; i<objs.length; i++) {
                                   for(var j=0; j<fields1.length; j++){
                                       projection[fields1[j]].push(objs[i][fields[j]]);
                                   }
                               }
                               if (!err) {
                                   log.info("Querying fields in %s",collection.collectionName);
                                   return res.json({
                                       status: 'OK',
                                       result: projection['_id']
                                   });
                               } else {
                                   res.statusCode = 500;
                                   log.error('Internal error(%d): %s',res.statusCode,err.message);
                                   return res.json({ error: 'Server error' });
                               }
                           });
                       } else {
                           res.statusCode = 500;
                           log.error('Write error: %s %s', err.message, result.getWriteErrors());
                           return res.json({ error: 'Server error' });
                       }
                   });
               }
            }
        });
    },

    //
    // Find and update
    //

    find_one_and_update: function(collection,req,res) {
        this.form_filter(collection,req.body.filter,String(req.user._id), function(filter) {
            collection.findOneAndUpdate(filter, req.body.update, {w:1}, function (err, result) {
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
        });
    },

    find_id_and_update: function(collection,req,res) {
        req.body.filter = {"_id": new ObjectID(req.params.id)};
        return this.find_one_and_update(collection,req,res);
    },

    //
    // Update
    //

    update: function(collection,req,res) {
        this.form_filter(collection,req.body.filter,String(req.user._id), function(filter) {
            collection.updateMany(filter, {'$set':req.body.update}, {w:1}, function (err, result) {
                if (!err) {
                    log.info("%d objects updated",result.modifiedCount);
                    return res.json({
                        status: 'OK',
                        result: result.modifiedCount
                    });
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    return res.json({ error: 'Server error' });
                }
            });
        });
    },

    replace_many: function(collection,req,res) {
        var batch = [];
        for(var i=0; i<req.body.length; i++) {
            var id = new ObjectID(req.body[i]._id);
            delete req.body[i]._id;
            batch.push({ replaceOne: { filter: {_id: id}, replacement: req.body[i]} });
        }
        collection.bulkWrite(batch,{w:1},function(err,result) {
            if (result.ok) {
                log.info("%s new objects replaced", String(result.modifiedCount));
                return res.json({
                    status: 'OK',
                    result: result.modifiedCount
                });
            } else {
                res.statusCode = 500;
                log.error('Write error: %s %s', err.message, result.getWriteErrors());
                return res.json({ error: 'Server error' });
            }
        });
    },

    update_one: function(collection,req,res) {
        return this.update(collection,req,res);
    },

    update_id: function(collection,req,res) {
        req.body.filter = {"_id": new ObjectID(req.params.id)};
        return this.update_one(collection,req,res);
    },

    //
    // Delete
    //

    delete: function(collection,req,res) {
        this.form_filter(collection,req.body,String(req.user._id), function(filter) {
            collection.deleteMany(filter, {}, function (err, result) {
                if (!err) {
                    log.info("Deleting %d objects from %s",result.deletedCount,collection.collectionName);
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
        });
    },

    delete_id: function(collection,req,res) {
        req.body = {"_id": new ObjectID(req.params.id)};
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
        var field = req.query.field;
        this.form_filter(collection,req.body.filter,String(req.user._id), function(filter) {
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
            o.scope = {field: field};
            o.query = filter;
            o.out = {replace: 'statistics' + '_' + field + '_' + collection.collectionName};
            collection.mapReduce(map, reduce, o, function (err, out_collection) {
                if(!err){
                    out_collection.find().toArray(function (err, result) {
                        if(!err) {
                            log.info("Computing statistics for %s",field);
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
        });
    }
};
