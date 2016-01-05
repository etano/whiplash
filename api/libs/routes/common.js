var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var ObjectID = require('mongodb').ObjectID;
var db = require(libs + 'db/mongo');

var crypto = require('crypto');
function checksum (str) {return crypto.createHash('md5').update(str, 'utf8').digest('hex');}

function add_metadata(filter)
{
    var special = ['$or','$and','$not','$nor'];
    var new_filter = {};
    for(var key in filter) {
        if(key === '_id')
            new_filter['_id'] = filter[key];
        else if(~special.indexOf(key)){
            new_filter[key] = []
            for(var i = 0; i < filter[key].length; i++)
                new_filter[key].push(add_metadata(filter[key][i]));
        }
        else{
            if(filter.hasOwnProperty(key)) {
                new_filter["metadata."+key] = filter[key];
            }
        }
    }
    return new_filter;
}

module.exports = {

    //
    // Permissions
    //

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
        //
        // scheduler is god
        // whiplash user is open to everyone
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
                                    filter['$or'] = {'owner': {'$in': [user_id,'whiplash']}, 'collaboration': {'$in': ids}};
                                } else {
                                    filter.owner = {'$in': [user_id,'whiplash']};
                                }
                            } else {
                                filter.owner = {'$in': [user_id,'whiplash']};
                            }
                        }
                    }

                    // Prepend metadata for models
                    if (collection.collectionName === "fs.files") {
                        filter = add_metadata(filter);
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

    validate: function(ObjType, objs, user_id, cb) {
        for(var i=0; i<objs.length; i++) {
            objs[i].owner = user_id;
            var obj = new ObjType(objs[i]);
            var err = obj.validateSync();
            if (!err) {
                obj = obj.toObject();
                delete objs[i]['_id'];
                for(var field in obj) {
                    if (!objs[i].hasOwnProperty(field) && field !== '_id'){
                        objs[i][field] = obj[field];
                    }
                }
            } else {
                cb(err);
            }
        }
        cb(null);
    },

    //
    // Return
    //

    return: function(res,err,obj) {
        if (!err) {
            return res.json({status: 'OK', result: obj});
        } else {
            return res.json({status: res.statusCode, error: JSON.stringify(err)});
        }
    },

    //
    // Query
    //

    query: function(collection, filter, user_id, res, cb) {
        this.form_filter(collection, filter, user_id, function(filter) {
            collection.find(filter).toArray(function (err, objs) {
                if(!objs) {
                    res.statusCode = 404;
                    cb(res,"Not found",0);
                } else if (!err) {
                    log.info("Found %d objects in %s",objs.length,collection.collectionName);
                    cb(res,0,objs);
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    cb(res,err.message,0);
                }
            });
        });
    },

    query_one: function(collection, filter, user_id, res, cb) {
        this.form_filter(collection, filter, user_id, function(filter) {
            collection.find(filter).limit(1).toArray(function (err, obj) {
                if(!obj) {
                    res.statusCode = 404;
                    cb(res,"Not found",0);
                } else if (!err) {
                    log.info("Query single object in %s",collection.collectionName);
                    cb(res,0,obj[0]);
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    cb(res,err.message,0);
                }
            });
        });
    },

    query_count: function(collection, filter, user_id, res, cb) {
        this.form_filter(collection, filter, user_id, function(filter) {
            collection.count(filter, function (err, count) {
                if (!err) {
                    log.info("Counting %d objects in %s",count,collection.collectionName);
                    cb(res,0,count);
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    cb(res,err.message,0);
                }
            });
        });
    },

    query_fields_only: function(collection, filter, fields, user_id, res, cb) {
        this.form_filter(collection, filter, user_id, function(filter) {
            var proj = {};
            for(var i=0; i<fields.length; i++){
                proj[fields[i]] = 1;
            }
            collection.find(filter).project(proj).toArray(function (err, objs) {
                if(!objs) {
                    res.statusCode = 404;
                    cb(res,"Not found",0);
                } else if (!err) {
                    log.info("Querying fields in %s",collection.collectionName);
                    cb(res,0,objs);
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    cb(res,err.message,0);
                }
            });
        });
    },

    //
    // Commit
    //

    commit: function(ObjType, collection, objs, user_id, res, cb) {
        this.validate(ObjType, objs, user_id, function(err) {
            if(err) {
                if(err.name === 'ValidationError') {
                    res.statusCode = 400;
                    log.error('Validation error(%d): %s', res.statusCode, err.message);
                    cb(res,err.message,0);
                } else {
                    res.statusCode = 500;
                    log.error('Server error(%d): %s', res.statusCode, err.message);
                    cb(res,err.message,0);
                }
            } else {
                if(objs.length === 0) {
                    cb(res,0,[]);
                } else {
                    var batch = [];
                    var unix_time = String(Math.round(new Date().getTime() / 1000));
                    var commit_tag = user_id + unix_time;
                    for(var i=0; i<objs.length; i++) {
                        if (collection.collectionName === "properties") {
                            objs[i]['md5'] = checksum(JSON.stringify(objs[i].params));
                        }
                        objs[i]['commit_tag'] = commit_tag;
                        batch.push({ updateOne: { filter: objs[i], update: {$set:{'commit_tag':commit_tag}}, upsert: false }});
                        batch.push({ insertOne: { document : objs[i] } });
                    }
                    collection.bulkWrite(batch,{w:1},function(err,result) {
                        if (result.ok) {
                            log.info("%s objects modified", String(result.modifiedCount));
                            log.info("%s objects inserted", String(result.insertedCount));
                            var tag_filter = {'commit_tag':commit_tag};
                            var proj = {'_id':1};
                            collection.find(tag_filter).project(proj).toArray(function (err, objs) {
                                if(!objs) {
                                    res.statusCode = 404;
                                    cb(res,"Not found",0);
                                } else if (!err) {
                                    var ids = [];
                                    for(var j=0; j<objs.length; j++) {
                                        ids.push(objs[j]['_id']);
                                    }
                                    log.info("Querying fields in %s",collection.collectionName);
                                    cb(res,0,ids);
                                } else {
                                    res.statusCode = 500;
                                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                                    cb(res,err.message,0);
                                }
                            });
                        } else {
                            res.statusCode = 500;
                            log.error('Write error: %s %s', err.message, result.getWriteErrors());
                            cb(res,err.message,0);
                        }
                    });
                }
            }
        });
    },

    //
    // Update
    //

    update: function(collection, filter, update, user_id, res, cb) {
        // FIXME: user can inadvertantly give access to someone else
        this.form_filter(collection, filter, user_id, function(filter) {
            collection.updateMany(filter, {'$set':update}, {w:1}, function (err, result) {
                if (!err) {
                    log.info("%d objects updated",result.modifiedCount);
                    cb(res,0,result.modifiedCount);
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    cb(res,err.message,0);
                }
            });
        });
    },

    replace: function(ObjType, collection, objs, user_id, res, cb) {
        // FIXME: user can inadvertantly give access to someone else
        var batch = [];
        for(var i=0; i<objs.length; i++) {
            var id = new ObjectID(objs[i]._id);
            delete objs[i]._id;
            batch.push({ replaceOne: { filter: {_id: id}, replacement: objs[i] } });
        }
        collection.bulkWrite(batch, {w:1}, function(err,result) {
            if (result.ok) {
                log.info("%s new objects replaced", String(result.modifiedCount));
                cb(res,0,result.modifiedCount);
            } else {
                res.statusCode = 500;
                log.error('Write error: %s %s', err.message, result.getWriteErrors());
                cb(res,err.message,0);
            }
        });
    },

    find_one_and_update: function(collection, filter, update, user_id, res, cb) {
        // FIXME: user can inadvertantly give access to someone else
        this.form_filter(collection, filter, user_id, function(filter) {
            collection.findOneAndUpdate(filter, update, {w:1}, function (err, result) {
                if (!err) {
                    log.info("Found and updated object in %s",collection.collectionName);
                    cb(res,0,result.value);
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    cb(res,err.message,0);
                }
            });
        });
    },

    //
    // Delete
    //

    delete: function(collection, filter, user_id, res, cb) {
        this.form_filter(collection, filter, user_id, function(filter) {
            collection.deleteMany(filter, {}, function (err, result) {
                if (!err) {
                    log.info("Deleting %d objects from %s",result.deletedCount,collection.collectionName);
                    cb(res,0,result.deletedCount);
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    cb(res,err.message,0);
                }
            });
        });
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
                                    result: {'diff':0,'sum':0,'count':0,'min':0,'max':0,'mean':0,'variance':0,'stddev':0}
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
