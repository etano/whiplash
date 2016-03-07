var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var GridStore = require('mongodb').GridStore;
var ObjectID = require('mongodb').ObjectID;
var db = require(libs + 'db/mongo');
var XXHash = require('xxhash').XXHash64;
require(libs + '/timer');

var AccessToken = require(libs + 'schemas/accessToken');
var Client = require(libs + 'schemas/client');
var Collaboration = require(libs + 'schemas/collaboration');
var Executable = require(libs + 'schemas/executable');
var Model = require(libs + 'schemas/model');
var Property = require(libs + 'schemas/property');
var Query = require(libs + 'schemas/query');
var RefreshToken = require(libs + 'schemas/refreshToken');
var User = require(libs + 'schemas/user');
var WorkBatch = require(libs + 'schemas/work_batch');
var collections = {
    'accesstokens': AccessToken,
    'clients': Client,
    'collaborations': Collaboration,
    'executables': Executable,
    'models': Model,
    'properties': Property,
    'queries': Query,
    'refreshtokens': RefreshToken,
    'users': User,
    'work_batches': WorkBatch
};

function validate(collection, objs, user_id, cb) {
    global.timer.get_timer('validate_'+collection.collectionName).start();
    log.debug('validate '+collection.collectionName);
    var bad_objs = [];
    if (collections.hasOwnProperty(collection.collectionName)) {
        var schema = collections[collection.collectionName];
        for (var i=0; i<objs.length; i++) {
            objs[i]['owner'] = user_id;
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
        global.timer.get_timer('validate_'+collection.collectionName).stop();
        cb(0, objs);
    } else {
        global.timer.get_timer('validate_'+collection.collectionName).stop();
        cb(bad_objs, 0);
    }
}

function form_ids(collection, objs, user_id, cb) {
    log.debug('form object ids');
    global.timer.get_timer('form_ids_'+collection.collectionName).start();
    if (collections.hasOwnProperty(collection.collectionName)) {
        if (collection.collectionName === 'models') {
            for (var i=0; i<objs.length; i++) {
                var id_obj = {};
                for (var key in objs[i]) {
                    if ((key !== 'timestamp') && (key !== '_id')) {
                        id_obj[key] = objs[i][key];
                    }
                }
                objs[i]['_id'] = hash(id_obj);
            }
        } else {
            var schema = collections[collection.collectionName];
            for (var i=0; i<objs.length; i++) {
                var id_obj = {};
                for (var key in schema) {
                    if (schema[key].unique) {
                        id_obj[key] = objs[i][key];
                    }
                }
                if (Object.keys(id_obj).length === 0) {
                    objs[i]['_id'] = new ObjectID();
                } else {
                    objs[i]['_id'] = hash(id_obj);
                }
            }
        }
        global.timer.get_timer('form_ids_'+collection.collectionName).stop();
        cb(0, objs);
    } else {
        global.timer.get_timer('form_ids_'+collection.collectionName).stop();
        cb({'message': 'Unrecognized collection '+collection.collectionName}, 0);
    }
}

function checksum(str) {
    // original version:
    // crypto.createHash('md5').update(str, 'utf8').digest('hex');
    global.timer.get_timer('checksum').start();
    var hash = new XXHash(0xCAFEBABE); // note: same seed each time
    var buffer = new Buffer(str, 'utf8');
    hash.update(buffer);
    var res = hash.digest('hex');
    global.timer.get_timer('checksum').stop();
    return res;
}

function smart_stringify(obj) {
    if(typeof(obj) !== 'object') return JSON.stringify(obj);
    global.timer.get_timer('smart_stringify').start();
    var keys = Object.keys(obj).sort();
    var str = '{';
    for(var i = 0; i < keys.length; i++)
        str += '"' + keys[i] + '":' + smart_stringify(obj[keys[i]]) + ',';
    str += '}';
    global.timer.get_timer('smart_stringify').stop();
    return str;
}

function hash(obj) {
    global.timer.get_timer('hash').start();
    var res = checksum(smart_stringify(obj));
    global.timer.get_timer('hash').stop();
    return res;
}

function commit_gridfs_obj(obj_id, obj_content) {
    log.debug('committing gridfs obj');
    global.timer.get_timer('commit_gridfs_obj').start();
    var options = { metadata: {} };
    var gridStore = new GridStore(db.get(), obj_id, String(obj_id), 'w', options);
    gridStore.open(function(err, gridStore) {
        if(err) {
            global.timer.get_timer('commit_gridfs_obj').stop();
            log.error("Error opening file: %s",err.message);
        } else {
            gridStore.write(JSON.stringify(obj_content), function(err, gridStore) {
                if(err) {
                    global.timer.get_timer('commit_gridfs_obj').stop();
                    log.error("Error writing file: %s",err.message);
                } else {
                    gridStore.close(function(err, result) {
                        if(err) {
                            log.error("Error closing file: %s",err.message);
                        }
                        global.timer.get_timer('commit_gridfs_obj').stop();
                    });
                }
            });
        }
    });
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

function get_gridfs_objs(objs, fields, res, cb) {
    log.debug('get_gridfs_objs');
    global.timer.get_timer('get_gridfs_objs').start();
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
                                    global.timer.get_timer('get_gridfs_objs').stop();
                                    cb(res,err,0);
                                }
                            }
                            objs[i][content_fields[j]] = obj;
                        }
                        apply_content(i+1);
                    } else {
                        apply_content(i+1);
                    }
                });
            } else {
                log.debug('added content to %d objects',objs.length);
                global.timer.get_timer('get_gridfs_objs').stop();
                cb(res,0,objs);
            }
        };
        apply_content(0);
    } else {
        log.debug('no added content');
        global.timer.get_timer('get_gridfs_objs').stop();
        cb(res,0,objs);
    }
}

function delete_gridfs_by_id(id, cb) {
    var gridStore = new GridStore(db.get(), id, String(id), 'w');
    gridStore.open(function(err, gs) {
        if(err) {
            log.error('Error opening file: %s',err.message);
            cb(err,gs);
        } else {
            gridStore.unlink(function(err, result) {
                if(err){
                    log.error('Error deleting file: %s',err.message);
                }
                cb(err,result);
            });
        }
    });
}

function delete_gridfs_by_filter(filter, res, cb) {
    var proj = {};
    proj._id = 1;
    db.get().collection('fs.files').find(filter).project(proj).toArray(function(err, objs) {
        if(!err) {
            if(objs.length > 0) {
                var items = [];
                var delete_objs = function(i){
                    if (i<objs.length) {
                        delete_gridfs_by_id(objs[i]._id, function(err, data) {
                            if(!err) {
                                delete_objs(i+1);
                            } else {
                                cb(res, err, 0);
                            }
                        });
                    } else {
                        log.debug('deleted %d objects', objs.length);
                        cb(res, 0, objs.length);
                    }
                };
                delete_objs(0);
            } else {
                cb(res, 0, 0);
            }
        } else {
            cb(res, err, 0);
        }
    });
}

function concaternate(o1, o2) {
    global.timer.get_timer('concaternate').start();
    for (var key in o2) {
        o1[key] = o2[key];
    }
    global.timer.get_timer('concaternate').stop();
    return o1;
}

function form_filter(collection, filter, user_id, cb) {
    global.timer.get_timer('form_filter_'+collection.collectionName).start();
    // Set permissions
    //
    // scheduler is god
    // passport gets a pass
    // whiplash user is open to everyone
    if ((!('collaboration' in filter)) && (!(user_id === "passport"))) {
        db.get().collection('collaborations').find({"users":user_id}).project({"_id":1}).toArray(function (err, objs) {
            db.get().collection('users').find({"_id":user_id}).limit(1).project({"username":1}).toArray(function (err2, objs2) {
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

                // Callback with filter
                global.timer.get_timer('form_filter_'+collection.collectionName).stop();
                cb(filter);
            });
        });
    } else {
        // Callback with filter
        global.timer.get_timer('form_filter_'+collection.collectionName).stop();
        cb(filter);
    }
}

function query(collection, filter, fields, user_id, res, cb) {
    global.timer.get_timer('query_'+collection.collectionName).start();
    log.debug('query '+collection.collectionName);
    form_filter(collection, filter, user_id, function(filter) {
        if (fields.length > 0) {
            var proj = {};
            for(var i=0; i<fields.length; i++) {
                proj[fields[i]] = 1;
            }
            collection.find(filter).project(proj).toArray(function (err, objs) {
                if (!err) {
                    log.debug('found %d objects',objs.length);
                    global.timer.get_timer('query_'+collection.collectionName).stop();
                    get_gridfs_objs(objs, fields, res, cb);
                } else {
                    global.timer.get_timer('query_'+collection.collectionName).stop();
                    cb(res, err, 0);
                }
            });
        } else {
            collection.find(filter).toArray(function (err, objs) {
                if (!err) {
                    log.debug('found %d objects',objs.length);
                    global.timer.get_timer('query_'+collection.collectionName).stop();
                    get_gridfs_objs(objs, fields, res, cb);
                } else {
                    global.timer.get_timer('query_'+collection.collectionName).stop();
                    cb(res,err,0);
                }
            });
        }
    });
}


module.exports = {
    //
    // Hash
    //

    hash: function(obj) {
        return hash(obj);
    },

    //
    // Stringify
    //

    smart_stringify: function(obj) {
        return smart_stringify(obj);
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
        form_filter(collection, filter, user_id, cb);
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
            return res.send({status: 'OK', result: obj});
        } else {
            log.error(JSON.stringify(err));
            if (!res.hasOwnProperty('statusCode')) {
                res.statusCode = 500;
            }
            global.timer.get_timer('return').stop();
            return res.send({status: res.statusCode, error: JSON.stringify(err)});
        }
    },

    //
    // Query
    //

    query: function(collection, filter, fields, user_id, res, cb) {
        query(collection, filter, fields, user_id, res, cb);
    },

    query_one: function(collection, filter, fields, user_id, res, cb) {
        query(collection, filter, fields, user_id, res, function(res, err, objs) {
            if (!err) {
                if (objs.length > 0) {
                    cb(res, err, objs[0]);
                } else {
                    cb(res, {message: "No objects found in "+collection.collectionName}, 0);
                }
            } else {
                cb(res, err, 0);
            }
        });
    },

    count: function(collection, filter, user_id, res, cb) {
        global.timer.get_timer('query_'+collection.collectionName).start();
        log.debug('count '+collection.collectionName);
        form_filter(collection, filter, user_id, function(filter) {
            collection.count(filter, function (err, count) {
                if (!err) {
                    log.debug('found %d objects', count);
                    global.timer.get_timer('query_'+collection.collectionName).stop();
                    cb(res,0,count);
                } else {
                    global.timer.get_timer('query_'+collection.collectionName).stop();
                    cb(res,err,0);
                }
            });
        });
    },

    //
    // Commit
    //

    commit: function(collection, objs, user_id, res, cb) {
        global.timer.get_timer('commit_'+collection.collectionName).start();
        log.debug('commit '+collection.collectionName);
        if (objs.length > 0) {
            validate(collection, objs, user_id, function(err, objs) {
                if(!err) {
                    form_ids(collection, objs, user_id, function(err, objs) {
                        if (!err) {
                            log.debug('form commit '+collection.collectionName);
                            global.timer.get_timer('commit_form_commit_'+collection.collectionName).start();
                            var batch = collection.initializeUnorderedBulkOp();
                            var ids = [];
                            var commit_tag = new ObjectID();
                            for(var i=0; i<objs.length; i++) {
                                ids.push(objs[i]['_id']);
                                if (objs[i].hasOwnProperty('content')) {
                                    var tmp_obj = {};
                                    tmp_obj['content'] = objs[i].content;
                                    commit_gridfs_obj(objs[i]._id, tmp_obj.content);
                                    delete objs[i].content;
                                }
                                batch.find({_id: objs[i]._id}).upsert().updateOne({
                                    "$setOnInsert": objs[i],
                                    "$set": {"commit_tag": commit_tag}
                                });
                            }
                            global.timer.get_timer('commit_form_commit_'+collection.collectionName).stop();
                            log.debug('do commit '+collection.collectionName);
                            global.timer.get_timer('commit_commit_'+collection.collectionName).start();
                            batch.execute(function(err, result) {
                                global.timer.get_timer('commit_commit_'+collection.collectionName).stop();
                                if (!err) {
                                    global.timer.get_timer('commit_'+collection.collectionName).stop();
                                    cb(res, 0, {"n_existing": result.nMatched, "n_new": result.nUpserted, 'ids': ids, 'commit_tag': commit_tag});
                                } else {
                                    global.timer.get_timer('commit_'+collection.collectionName).stop();
                                    cb(res, err, 0);
                                }
                            });
                        } else {
                            global.timer.get_timer('commit_'+collection.collectionName).stop();
                            cb(res,err,0);
                        }
                    });
                } else {
                    global.timer.get_timer('commit_'+collection.collectionName).stop();
                    cb(res,err,0);
                }
            });
        } else {
            cb(res, 0, {"n_existing": 0, "n_new": 0, "ids": []});
        }
    },

    //
    // Update
    //

    update: function(collection, filter, update, user_id, res, cb) {
        global.timer.get_timer('update_'+collection.collectionName).start();
        log.debug('update '+collection.collectionName);
        form_filter(collection, filter, user_id, function(filter) {
            collection.updateMany(filter, {'$set':update}, {w:1}, function (err, result) {
                if (!err) {
                    log.debug('updated %d objects',result.modifiedCount);
                    global.timer.get_timer('update_'+collection.collectionName).stop();
                    cb(res,0,result.modifiedCount);
                } else {
                    global.timer.get_timer('update_'+collection.collectionName).stop();
                    cb(res,err,0);
                }
            });
        });
    },

    //
    // Replace
    //

    replace: function(collection, objs, user_id, res, cb) {
        global.timer.get_timer('replace_'+collection.collectionName).start();
        log.debug('replace '+collection.collectionName);
        var batch = [];
        for(var i=0; i<objs.length; i++) {
            var id = objs[i]._id;
            delete objs[i]._id;
            batch.push({ replaceOne: { filter: {_id: id}, replacement: objs[i] } });
        }
        collection.bulkWrite(batch, {w:1}, function(err,result) {
            if (result.ok) {
                log.debug('replaced %d objects', result.modifiedCount);
                global.timer.get_timer('replace_'+collection.collectionName).stop();
                cb(res, 0, result.modifiedCount);
            } else {
                global.timer.get_timer('replace_'+collection.collectionName).stop();
                cb(res, err, 0);
            }
        });
    },

    //
    // Pop
    //

    pop: function(collection, filter, sort, user_id, res, cb) {
        global.timer.get_timer('pop_'+collection.collectionName).start();
        log.debug('pop '+collection.collectionName);
        form_filter(collection, filter, user_id, function(filter) {
            collection.findOneAndDelete(filter, {sort: sort}, function (err, result) {
                if (!err) {
                    if (result.value) {
                        log.debug('popped 1 objects');
                        global.timer.get_timer('pop_'+collection.collectionName).stop();
                        cb(res, 0, result.value);
                    } else {
                        global.timer.get_timer('pop_'+collection.collectionName).stop();
                        cb(res, 0, 0);
                    }
                } else {
                    global.timer.get_timer('pop_'+collection.collectionName).stop();
                    cb(res, err, 0);
                }
            });
        });
    },

    //
    // Delete
    //

    delete: function(collection, filter, user_id, res, cb) {
        global.timer.get_timer('delete_'+collection.collectionName).start();
        log.debug('delete '+collection.collectionName);
        form_filter(collection, filter, user_id, function(filter) {
            collection.deleteMany(filter, {}, function (err, result) {
                if (!err) {
                    log.debug('deleted %d objects', result.deletedCount);
                    global.timer.get_timer('delete_'+collection.collectionName).stop();
                    // FIXME: Need to delete gridfs things too
                    cb(res, 0, result.deletedCount);
                } else {
                    global.timer.get_timer('delete_'+collection.collectionName).stop();
                    cb(res, err, 0);
                }
            });
        });
    },

    //
    // Map-reduce
    //

    stats: function(collection, filter, field, map, user_id, res, cb) {
        global.timer.get_timer('stats_'+collection.collectionName).start();
        log.debug('stats '+collection.collectionName);
        form_filter(collection, filter, user_id, function(filter) {
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
                                global.timer.get_timer('stats_'+collection.collectionName).stop();
                                cb(res, 0, result[0].value);
                            } else {
                                global.timer.get_timer('stats_'+collection.collectionName).stop();
                                cb(res, 0, {'diff':0,'sum':0,'count':0,'min':0,'max':0,'mean':0,'variance':0,'stddev':0});
                            }
                        } else {
                            log.error('Internal error(%d): %s',res.statusCode,err.message);
                            global.timer.get_timer('stats_'+collection.collectionName).stop();
                            cb(res, err, 0);
                        }
                    });
                } else {
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    global.timer.get_timer('stats_'+collection.collectionName).stop();
                    cb(res, err, 0);
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
        form_filter(collection,req.body.filter,String(req.user._id), function(filter) {
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
                                return res.send({
                                    status: 'OK',
                                    result: result[0].value
                                });
                            } else {
                                return res.send({
                                    status: 'OK',
                                    result: {'diff':0,'sum':0,'count':0,'min':0,'max':0,'mean':0,'variance':0,'stddev':0}
                                });
                            }
                        } else {
                            res.statusCode = 500;
                            log.error('Internal error(%d): %s',res.statusCode,err.message);
                            return res.send({ error: 'Server error' });
                        }
                    });
                } else {
                    res.statusCode = 500;
                    log.error('Internal error(%d): %s',res.statusCode,err.message);
                    return res.send({ error: 'Server error' });
                }
            });
        });
    },

    distinct: function(collection, filter, fields, user_id, res, cb) {
        global.timer.get_timer('query_'+collection.collectionName).start();
        log.debug('count '+collection.collectionName);
        this.form_filter(collection, filter, user_id, function(filter) {
            collection.distinct(fields,filter,function (err, objs) {
                if (!err) {
                    return res.send({status: "OK",result:objs});
                }
                else{
                  res.statusCode = 500;
                  log.error('Internal error(%d): %s',res.statusCode,err.message);
                  return res.send({error: "Server Error"});
                };
            });
        });
    },

};
