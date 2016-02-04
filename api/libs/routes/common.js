var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var GridStore = require('mongodb').GridStore;
var ObjectID = require('mongodb').ObjectID;
var db = require(libs + 'db/mongo');
//var hash = require('object-hash');
var crypto = require('crypto');
var Property = require(libs + 'schemas/property');
var Executable = require(libs + 'schemas/executable');
var collections = {'executables': Executable, 'properties': Property};

function validate(collection, objs, user_id, cb) {
    global.timer.get_timer('validate').start();
    log.debug('validate '+collection.collectionName);
    var t0 = i
    for (var i=0; i<objs.length; i++) {
        objs[i]['owner'] = user_id;
    }
    var bad_objs = [];
    if (collections.hasOwnProperty(collection.collectionName)) {
        var schema = collections[collection.collectionName];
        for (var i=0; i<objs.length; i++) {
            for (var key in schema) {
                if (!objs[i].hasOwnProperty(key)) {
                    if (schema[key].required) {
                        if (!schema[key].hasOwnProperty('default')) {
                            bad_objs.push({'index': i, 'key': key});
                            continue;
                        }
                        objs[i][key] = schema[key].default;
                    }
                }
            }
        }
    }
    if (bad_objs.length === 0) {
        global.timer.get_timer('validate').stop();
        cb(0, objs);
    } else {
        global.timer.get_timer('validate').stop();
        cb(bad_objs, 0);
    }
}

function checksum(str) {
    global.timer.get_timer('checksum').start();
    var res = crypto.createHash('md5').update(str, 'utf8').digest('hex');
    global.timer.get_timer('checksum').stop();
    return res;
}

function get_sorted_keys(obj) {
    global.timer.get_timer('get_sorted_keys').start();
    var keys = [];
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys.push(key);
        }
    }
    keys.sort();
    global.timer.get_timer('get_sorted_keys').stop();
    return keys;
}

function smart_stringify(obj) {
    global.timer.get_timer('smart_stringify').start();
    var keys = get_sorted_keys(obj);
    var str = "{";
    for(var i=0; i<keys.length; i++) {
        str += "\""+keys[i]+"\":";
        if (typeof(obj[keys[i]]) === 'object') {
            str += smart_stringify(obj[keys[i]]);
        } else {
            str += JSON.stringify(obj[keys[i]])+",";
        }
    }
    str += "}";
    global.timer.get_timer('smart_stringify').stop();
    return str;
}

function hash(obj) {
    global.timer.get_timer('hash').start();
    var res = checksum(smart_stringify(obj));
    global.timer.get_timer('hash').stop();
    return res;
}

function get_gridfs_filter(filter) {
    global.timer.get_timer('get_gridfs_filter').start();
    var special = ['$or','$and','$not','$nor'];
    var new_filter = {};
    for(var key in filter) {
        if(key === '_id') {
            new_filter['_id'] = filter[key];
        } else if(~special.indexOf(key)) {
            new_filter[key] = [];
            for (var i = 0; i < filter[key].length; i++) {
                new_filter[key].push(get_gridfs_filter(filter[key][i]));
            }
        } else {
            if(filter.hasOwnProperty(key)) {
                new_filter["metadata."+key] = filter[key];
            }
        }
    }
    global.timer.get_timer('get_gridfs_filter').stop();
    return new_filter;
}

function get_gridfs_metadata_fields(fields) {
    global.timer.get_timer('get_gridfs_metadata_fields').start();
    var special = ['_id','filename','contentType','length','chunkSize','uploadDate','aliases','metadata','md5','content'];
    var metadata_fields = [];
    for(var i=0; i<fields.length; i++) {
        if((!~special.indexOf(fields[i])) && (!~fields[i].indexOf('content.'))) {
            metadata_fields.push('metadata.' + fields[i]);
        } else {
            metadata_fields.push(fields[i]);
        }
    }
    global.timer.get_timer('get_gridfs_metadata_fields').stop();
    return metadata_fields;
}

function get_gridfs_content_fields(fields) {
    global.timer.get_timer('get_gridfs_content_fields').start();
    if (fields.length === 0) {
        global.timer.get_timer('get_gridfs_content_fields').stop();
        return ['content'];
    } else {
        var content_fields = [];
        for(var i=0; i<fields.length; i++) {
            if((fields[i] === 'content') || (~fields[i].indexOf('content.'))) {
                content_fields.push(fields[i]);
            }
        }
        global.timer.get_timer('get_gridfs_content_fields').stop();
        return content_fields;
    }
}

function concaternate(o1, o2) {
    global.timer.get_timer('concaternate').start();
    for (var key in o2) {
        o1[key] = o2[key];
    }
    global.timer.get_timer('concaternate').stop();
    return o1;
}

module.exports = {
    //
    // Hash
    //

    hash: function(obj) {
        global.timer.get_timer('hash').start();
        var res = checksum(smart_stringify(obj));
        global.timer.get_timer('hash').stop();
        return res;
    },

    //
    // Get payload
    //

    get_payload: function(req, key) {
        global.timer.get_timer('get_payload').start();
        if (!req.query[key]) {
            if (!req.body[key]) {
                global.timer.get_timer('get_payload').stop();
                return req.body;
            } else {
                global.timer.get_timer('get_payload').stop();
                return req.body[key];
            }
        } else {
            global.timer.get_timer('get_payload').stop();
            return JSON.parse(req.query[key]);
        }
    },

    //
    // Permissions
    //

    form_filter: function(collection, filter, user_id, cb) {
        global.timer.get_timer('form_filter').start();
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
                        filter = get_gridfs_filter(filter);
                    }

                    // Callback with filter
                    global.timer.get_timer('form_filter').stop();
                    cb(filter);
                });
            });
        } else {
            // Prepend metadata for models
            if (collection.collectionName === "fs.files") {
                filter = get_gridfs_filter(filter);
            }

            // Callback with filter
            global.timer.get_timer('form_filter').stop();
            cb(filter);
        }
    },

    //
    // Return
    //

    return: function(res, err, obj) {
        global.timer.get_timer('return').start();
        if (!err) {
            if (isNaN(obj)) {
                var x = obj.length;
                if (isNaN(x)) {
                    log.debug('returning object');
                } else {
                    log.debug('returning %d objects', obj.length);
                }
            } else {
                log.debug('returning '+JSON.stringify(obj));
            }
            global.timer.get_timer('return').stop();
            return res.json({status: 'OK', result: obj});
        } else {
            log.error(JSON.stringify(err));
            if (!res.hasOwnProperty('statusCode')) {
                res.statusCode = 500;
            }
            global.timer.get_timer('return').stop();
            return res.json({status: res.statusCode, error: JSON.stringify(err)});
        }
    },

    //
    // Query
    //

    query: function(collection, filter, fields, user_id, res, cb) {
        global.timer.get_timer('query').start();
        log.debug('query '+collection.collectionName);
        this.form_filter(collection, filter, user_id, function(filter) {
            if (fields.length > 0) {
                var new_fields = fields;
                if (collection.collectionName === "fs.files") {
                    new_fields = get_gridfs_metadata_fields(fields);
                }
                var proj = {};
                for(var i=0; i<new_fields.length; i++) {
                    proj[new_fields[i]] = 1;
                }
                collection.find(filter).project(proj).toArray(function (err, objs) {
                    if (!err) {
                        if (collection.collectionName === "fs.files") {
                            for(var i=0; i<objs.length; i++){
                                if(objs[i].hasOwnProperty('metadata')) {
                                    var metadata = objs[i].metadata;
                                    delete objs[i].metadata;
                                    for(var key in metadata){
                                        objs[i][key] = metadata[key];
                                    }
                                }
                            }
                        }
                        log.debug('found %d objects',objs.length);
                        global.timer.get_timer('query').stop();
                        cb(res,0,objs);
                    } else {
                        global.timer.get_timer('query').stop();
                        cb(res,err,0);
                    }
                });
            } else {
                collection.find(filter).toArray(function (err, objs) {
                    if (!err) {
                        if (collection.collectionName === "fs.files") {
                            for(var i=0; i<objs.length; i++){
                                if(objs[i].hasOwnProperty('metadata')) {
                                    var metadata = objs[i].metadata;
                                    delete objs[i].metadata;
                                    for(var key in metadata){
                                        objs[i][key] = metadata[key];
                                    }
                                }
                            }
                        }
                        log.debug('found %d objects',objs.length);
                        global.timer.get_timer('query').stop();
                        cb(res,0,objs);
                    } else {
                        global.timer.get_timer('query').stop();
                        cb(res,err,0);
                    }
                });
            }
        });
    },

    count: function(collection, filter, user_id, res, cb) {
        global.timer.get_timer('query').start();
        log.debug('count '+collection.collectionName);
        this.form_filter(collection, filter, user_id, function(filter) {
            collection.count(filter, function (err, count) {
                if (!err) {
                    log.debug('found %d objects', count);
                    global.timer.get_timer('query').stop();
                    cb(res,0,count);
                } else {
                    global.timer.get_timer('query').stop();
                    cb(res,err,0);
                }
            });
        });
    },

    //
    // Commit
    //

    commit: function(collection, orig_objs, user_id, res, cb) {
        global.timer.get_timer('commit').start();
        log.debug('commit '+collection.collectionName);
        var ids = [];
        var max_chunk_size = 10000;
        var commit_next_chunk = function(chunk_i, chunk_j) {
            if (chunk_i === orig_objs.length) {
                global.timer.get_timer('commit').stop();
                cb(res,0,ids);
            } else {
                validate(collection, orig_objs.slice(chunk_i, chunk_j), user_id, function(err, objs) {
                    if(err) {
                        global.timer.get_timer('commit').stop();
                        cb(res,err,0);
                    } else {
                        if(objs.length === 0) {
                            global.timer.get_timer('commit').stop();
                            cb(res,0,[]);
                        } else {
                            log.debug('hash objects');
                            var commit_tag = user_id + String(Math.round(new Date().getTime() / 1000)) + crypto.randomBytes(8).toString('hex');
                            for(var i=0; i<objs.length; i++) {
                                objs[i]['commit_tag'] = commit_tag;
                                if (collection.collectionName === "properties") {
                                    objs[i]['md5'] = hash(objs[i].params);
                                } else if (collection.collectionName === "queries") {
                                    objs[i]['md5'] = hash(objs[i]['filters']) + hash(objs[i]['fields']);
                                    objs[i]['filters'] = smart_stringify(objs[i].filters);
                                }
                            }
                            log.debug('form commit filter');
                            var batch = [];
                            for(var i=0; i<objs.length; i++) {
                                var filter = {};
                                if (collection.collectionName === "fs.files") {
                                    filter['metadata'] = {};
                                    filter['metadata']['property_id'] = objs[i]['metadata']['property_id'];
                                    filter['metadata']['owner'] = objs[i]['metadata']['owner'];
                                    filter['metadata']['md5'] = objs[i]['metadata']['md5'];
                                }
                                else if(collection.collectionName === "executables") {
                                    filter['name'] = objs[i]['name'];
                                    filter['algorithm'] = objs[i]['algorithm'];
                                    filter['version'] = objs[i]['version'];
                                    filter['build'] = objs[i]['build'];
                                    filter['owner'] = objs[i]['owner'];
                                }
                                else if (collection.collectionName === "properties") {
                                    filter['input_model_id'] = objs[i]['input_model_id'];
                                    filter['executable_id'] = objs[i]['executable_id'];
                                    filter['md5'] = objs[i]['md5'];
                                    filter['owner'] = objs[i]['owner'];
                                }
                                else if (collection.collectionName === "queries") {
                                    filter['owner'] = objs[i]['owner'];
                                    filter['md5'] = objs[i]['md5'];
                                }
                                else if (collection.collectionName === "collaborations") {
                                    filter['name'] = objs[i]['name'];
                                }
                                else if (collection.collectionName === "users") {
                                    filter['username'] = objs[i]['username'];
                                }
                                else if (collection.collectionName === "clients") {
                                    filter['name'] = objs[i]['name'];
                                }
                                else if (collection.collectionName === "work_batches") {
                                    filter['timestamp'] = objs[i]['timestamp'];
                                }
                                batch.push({ updateOne: { filter: filter, update: {$set:{'commit_tag':commit_tag}}, upsert: false }});
                            }
                            log.debug('apply commit tag');
                            collection.bulkWrite(batch, {ordered: false, w:1}, function(err, result) {
                                if (result.ok) {
                                    log.info("%s objects modified on commit tag update to %s collection", String(result.nModified),collection.collectionName);
                                    log.info("%s objects inserted on commit tag update to %s collection", String(result.nInserted),collection.collectionName);
                                    log.info("%s objects upserted on commit tag update to %s collection", String(result.nUpserted),collection.collectionName);
                                    var batch = [];
                                    for(var i=0; i<objs.length; i++) {
                                        batch.push({ insertOne: { document : objs[i] } });
                                    }
                                    log.debug('attempt insertion');
                                    collection.bulkWrite(batch,{ordered: false, w:1},function(err,result) {
                                        if (result.ok) {
                                            log.info("%s objects modified on insert to %s collection", String(result.nModified),collection.collectionName);
                                            log.info("%s objects inserted on insert to %s collection", String(result.nInserted),collection.collectionName);
                                            log.info("%s objects upserted on insert to %s collection", String(result.nUpserted),collection.collectionName);
                                            res.nInserted = result.nInserted;
                                            var tag_filter = {'commit_tag': commit_tag};
                                            var proj = {'_id':1};
                                            log.debug('get object ids');
                                            collection.find(tag_filter).project(proj).toArray(function (err, objs) {
                                                if (!err) {
                                                    for(var j=0; j<objs.length; j++) {
                                                        ids.push(objs[j]['_id']);
                                                    }
                                                    log.debug('found %d objects',objs.length);
                                                    commit_next_chunk(chunk_j, Math.min(orig_objs.length, chunk_j+max_chunk_size));
                                                } else {
                                                    global.timer.get_timer('commit').stop();
                                                    cb(res,err,0);
                                                }
                                            });
                                        } else {
                                            global.timer.get_timer('commit').stop();
                                            cb(res,err,0);
                                        }
                                    });
                                } else {
                                    global.timer.get_timer('commit').stop();
                                    cb(res,err,0);
                                }
                            });
                        }
                    }
                });
            }
        };
        commit_next_chunk(0, Math.min(orig_objs.length, max_chunk_size));
    },

    //
    // Update
    //

    update: function(collection, filter, update, user_id, res, cb) {
        global.timer.get_timer('update').start();
        log.debug('update '+collection.collectionName);
        // FIXME: user can inadvertantly give access to someone else
        this.form_filter(collection, filter, user_id, function(filter) {
            collection.updateMany(filter, {'$set':update}, {w:1}, function (err, result) {
                if (!err) {
                    log.debug('updated %d objects',result.modifiedCount);
                    global.timer.get_timer('update').stop();
                    cb(res,0,result.modifiedCount);
                } else {
                    global.timer.get_timer('update').stop();
                    cb(res,err,0);
                }
            });
        });
    },

    //
    // Replace
    //

    replace: function(collection, objs, user_id, res, cb) {
        global.timer.get_timer('replace').start();
        log.debug('replace '+collection.collectionName);
        // FIXME: user can inadvertantly give access to someone else
        var batch = [];
        for(var i=0; i<objs.length; i++) {
            var id = new ObjectID(objs[i]._id);
            delete objs[i]._id;
            batch.push({ replaceOne: { filter: {_id: id}, replacement: objs[i] } });
        }
        collection.bulkWrite(batch, {w:1}, function(err,result) {
            if (result.ok) {
                log.debug('replaced %d objects', result.modifiedCount);
                global.timer.get_timer('replace').stop();
                cb(res, 0, result.modifiedCount);
            } else {
                global.timer.get_timer('replace').stop();
                cb(res, err, 0);
            }
        });
    },

    //
    // Pop
    //

    pop: function(collection, filter, sort, user_id, res, cb) {
        global.timer.get_timer('pop').start();
        log.debug('pop '+collection.collectionName);
        this.form_filter(collection, filter, user_id, function(filter) {
            collection.findOneAndDelete(filter, {sort: sort}, function (err, result) {
                if (!err) {
                    if (result.value) {
                        log.debug('popped %d objects', result.deletedCount);
                        global.timer.get_timer('pop').stop();
                        cb(res, 0, result.value);
                    } else {
                        global.timer.get_timer('pop').stop();
                        cb(res, 0, 0);
                    }
                } else {
                    global.timer.get_timer('pop').stop();
                    cb(res, err, 0);
                }
            });
        });
    },

    //
    // Delete
    //

    delete: function(collection, filter, user_id, res, cb) {
        global.timer.get_timer('delete').start();
        log.debug('delete '+collection.collectionName);
        this.form_filter(collection, filter, user_id, function(filter) {
            collection.deleteMany(filter, {}, function (err, result) {
                if (!err) {
                    log.debug('deleted %d objects', result.deletedCount);
                    global.timer.get_timer('delete').stop();
                    cb(res, 0, result.deletedCount);
                } else {
                    global.timer.get_timer('delete').stop();
                    cb(res, err, 0);
                }
            });
        });
    },

    //
    // Map-reduce
    //

    stats: function(collection,req,res,map) {
        global.timer.get_timer('stats').start();
        log.debug('stats '+collection.collectionName);
        if (!req.query.field) {
            req.query.field = req.body.field;
            req.query.filter = req.body.filter;
        }
        var field = req.query.field;
        this.form_filter(collection,req.body.filter,String(req.user._id), function(filter) {
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
                                global.timer.get_timer('stats').stop();
                                return res.json({
                                    status: 'OK',
                                    result: result[0].value
                                });
                            } else {
                                global.timer.get_timer('stats').stop();
                                return res.json({
                                    status: 'OK',
                                    result: {'diff':0,'sum':0,'count':0,'min':0,'max':0,'mean':0,'variance':0,'stddev':0}
                                });
                            }
                        } else {
                            res.statusCode = 500;
                            log.error('Internal error(%d): %s',res.statusCode,err.message);
                            global.timer.get_timer('stats').stop();
                            return res.json({ error: 'Server error' });
                        }
                    });
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    global.timer.get_timer('stats').stop();
                    return res.json({ error: 'Server error' });
                }
            });
        });
    },


    mapreduce: function(collection,req,res) {
        log.debug('mapreduce '+collection.collectionName);
        if (!req.query.field) {
            req.query.filter = req.body.filter;
            req.query.map = req.body.map;
            req.query.reduce=req.body.reduce;
            req.query.finalize=req.body.finalize;
        }
        this.form_filter(collection,req.body.filter,String(req.user._id), function(filter) {
            eval(String(req.query.map));
            eval(String(req.query.reduce));
            eval(String(req.query.finalize));
            var o = {};
            o.finalize = finalize;
            o.query = filter;
            o.out = {replace: 'mapreduce' + '_' + collection.collectionName};
            collection.mapReduce(map, reduce, o, function (err, out_collection) {
                if(!err){
                    out_collection.find().toArray(function (err, result) {
                        if(!err) {
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
    },

    //
    // GridFS helpers
    //

    get_gridfs_objs: function(objs, fields, res, cb) {
        log.debug('get_gridfs_objs');
        var content_fields = get_gridfs_content_fields(fields);
        if (content_fields.length > 0) {
            var apply_content = function(i){
                if (i<objs.length) {
                    var name = String(objs[i]._id);
                    GridStore.read(db.get(), name, function(err, fileData) {
                        if(!err) {
                            var data = JSON.parse(fileData.toString());
                            for(var j=0; j<content_fields.length; j++) {
                                var subfields = content_fields[j].split('.');
                                var obj = data;
                                for(var k=1; k<subfields.length; k++) {
                                    if (obj[subfields[k]]) {
                                        obj = obj[subfields[k]];
                                    } else {
                                        err = {"message":"Field " + content_fields[j] + " not found in " + name};
                                        cb(res,err,0);
                                    }
                                }
                                objs[i][content_fields[j]] = obj;
                            }
                            apply_content(i+1);
                        } else {
                            cb(res,err,0);
                        }
                    });
                } else {
                    log.debug('added content to %d objects',objs.length);
                    cb(res,0,objs);
                }
            };
            apply_content(0);
        } else {
            for(var i=0; i<objs.length; i++) {
                objs[i]['content'] = {};
            }
            log.debug('no added content');
            cb(res,0,objs);
        }
    },

};
