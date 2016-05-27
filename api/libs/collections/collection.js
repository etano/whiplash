var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var GridStore = require('mongodb').GridStore;
var ObjectID = require('mongodb').ObjectID;
var co = require('co');
var db = require(libs + 'db/mongo');
var common = require(libs + 'routes/common');
require(libs + '/timer');

function commit_gridfs_obj(obj_id, obj_content) {
    global.timer.get_timer('commit_gridfs_obj').start();
    return new Promise(function(resolve, reject) {
        co(function *() {
            var options = { metadata: {} };
            var gridStore = new GridStore(db.get(), obj_id, String(obj_id), 'w', options);
            yield gridStore.open();
            yield gridStore.write(JSON.stringify(obj_content));
            yield gridStore.close();
            global.timer.get_timer('commit_gridfs_obj').stop();
            resolve(obj_id);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('commit_gridfs_obj').stop();
            reject(err);
        });
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

function get_gridfs_objs(objs, fields) {
    global.timer.get_timer('get_gridfs_objs').start();
    return new Promise(function(resolve, reject) {
        co(function *() {
            var content_fields = get_gridfs_content_fields(fields);
            if (content_fields.length > 0) {
                for (var i=0; i<objs.length; i++) {
                    if (objs[i].has_content) {
                        var name = String(objs[i]._id);
                        console.log(content_fields);
                        var file_data = yield GridStore.read(db.get(), name);
                        var data = JSON.parse(file_data.toString());
                        for(var j=0; j<content_fields.length; j++) {
                            var subfields = content_fields[j].split('.');
                            var obj = data;
                            for(var k=1; k<subfields.length; k++) {
                                if (!obj[subfields[k]])
                                    throw "Field "+content_fields[j]+" not found in "+name;
                                obj = obj[subfields[k]];
                            }
                            objs[i][content_fields[j]] = obj;
                        }
                    }
                }
                log.debug('added content to %d objects',objs.length);
            } else {
                log.debug('no added content');
            }
            global.timer.get_timer('get_gridfs_objs').stop();
            resolve(objs);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('get_gridfs_objs').stop();
            reject(err);
        });
    });
}

function delete_gridfs_by_id(id) {
    co(function *() {
        global.timer.get_timer('delete_gridfs_by_id').start();
        var grid_store = new GridStore(db.get(), id, String(id), 'w');
        yield grid_store.open();
        yield grid_store.unlink();
    }).catch(function(err) {
        log.error(err);
        global.timer.get_timer('delete_gridfs_by_id').stop();
    });
}

function query(collection, filter, fields, user_id) {
    return new Promise(function(resolve, reject) {
        co(function *() {
            filter = yield collection.attach_permissions(filter, user_id);
            var objs = [];
            if (fields.length > 0) {
                var proj = {};
                for(var i=0; i<fields.length; i++) {
                    proj[fields[i]] = 1;
                }
                objs = yield db.get().collection(collection.name).find(filter).project(proj).toArray();
            } else {
                objs = yield db.get().collection(collection.name).find(filter).toArray();
            }
            objs = yield get_gridfs_objs(objs, fields);
            return objs;
        }).then(function(objs) {
            global.timer.get_timer('query_'+collection.name).stop();
            resolve(objs);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('query_'+collection.name).stop();
            reject(err);
        });
    });
}

class Collection {
    constructor(model) {
        this.name = model.name;
        this.schema = model.schema;
        this.indexes = model.indexes;
    }

    validate(objs, user_id) {
        var self = this;
        global.timer.get_timer('validate_'+self.name).start();
        return new Promise(function(resolve, reject) {
            var bad_objs = [];
            for (var i=0; i<objs.length; i++) {
                if (!objs[i].owner) objs[i].owner = user_id;
                for (var key in self.schema) {
                    if (!objs[i].hasOwnProperty(key)) {
                        if (self.schema[key].required) {
                            if (!self.schema[key].hasOwnProperty('default')) {
                                bad_objs.push({'index': i, 'key': key});
                                continue;
                            }
                            objs[i][key] = self.schema[key].default;
                        }
                    }
                }
            }
            if (bad_objs.length === 0) {
                global.timer.get_timer('validate_'+self.name).stop();
                resolve(objs);
            } else {
                global.timer.get_timer('validate_'+self.name).stop();
                reject(bad_objs);
            }
        });
    }

    form_ids(objs, user_id, cb) {
        var self = this;
        global.timer.get_timer('form_ids_'+self.name).start();
        return new Promise(function(resolve, reject) {
            var i, id_obj, key;
            if (self.name === 'models') {
                for (i=0; i<objs.length; i++) {
                    id_obj = {};
                    for (key in objs[i]) {
                        if ((key !== 'timestamp') && (key !== '_id')) {
                            id_obj[key] = objs[i][key];
                        }
                    }
                    objs[i]['_id'] = common.hash(id_obj);
                }
            } else {
                for (i=0; i<objs.length; i++) {
                    id_obj = {};
                    for (key in self.schema) {
                        if (self.schema[key].unique) {
                            id_obj[key] = objs[i][key];
                        }
                    }
                    if (Object.keys(id_obj).length === 0) {
                        objs[i]['_id'] = new ObjectID();
                    } else {
                        objs[i]['_id'] = common.hash(id_obj);
                    }
                }
            }
            global.timer.get_timer('form_ids_'+self.name).stop();
            resolve(objs);
        });
    }

    /**
     * @apiDefine admin Admin access only
     * This method is only for the "admin" user
     */
    /**
     * @apiDefine user User access only
     * This method can only affect what is owned by the user who calls it or the "admin" user.
     */
    attach_permissions(obj, user_id) {
        var self = this;
        global.timer.get_timer('attach_permissions_'+self.name).start();
        return new Promise(function(resolve, reject) {
            co(function *() {
                if (user_id !== "admin") {
                    var users = yield db.get().collection('users').find({"_id":user_id}).limit(1).project({"username":1}).toArray();
                    if(users.length>0) {
                        if((users[0]['username'] !== "admin")) { // admin can do anything
                            if (Array.isArray(obj)) {
                                for (var i=0; i<obj.length; i++) {
                                    obj[i].owner = user_id;
                                }
                            } else {
                                obj.owner = user_id;
                            }
                        }
                    }
                }
                global.timer.get_timer('attach_permissions_'+self.name).stop();
                resolve(obj);
            }).catch(function(err) {
                log.error(err);
                global.timer.get_timer('attach_permissions_'+self.name).stop();
                reject(err);
            });
        });
    }

    /**
     * @apiDefine Query
     * @apiName Query
     * @apiVersion 1.0.0
     *
     * @apiParam {Object} filter Query filter.
     * @apiParam {String[]} [fields] Which fields should be returned.
     *
     * @apiSuccess {Object[]} result List of objects that matched the query filter, each with the specified fields plus the "_id" field.
     *
     */
    query(filter, fields, user_id, res, cb) {
        global.timer.get_timer('query_'+self.name).start();
        var self = this;
        co(function *() {
            var objs = yield query(self, filter, fields, user_id);
            return objs;
        }).then(function(objs) {
            log.debug('found %d objects', objs.length);
            global.timer.get_timer('query_'+self.name).stop();
            cb(res, 0, objs);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('query_'+self.name).stop();
            cb(res, err, 0);
        });
    }

    /**
     * @apiDefine QueryOne
     * @apiName QueryOne
     * @apiVersion 1.0.0
     *
     * @apiParam {Object} filter Query filter.
     * @apiParam {String[]} [fields] Which fields should be returned.
     *
     * @apiSuccess {Object} result Single object that matched the query filter, with the specified fields plus the "_id" field.
     */
    query_one(filter, fields, user_id, res, cb) {
        var self = this;
        co(function *() {
            var objs = yield query(self, filter, fields, user_id);
            if (objs.length === 0) return 0;
            log.debug('found object');
            return objs[0];
        }).then(function(obj) {
            global.timer.get_timer('query_'+self.name).stop();
            cb(res, 0, obj);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('query_'+self.name).stop();
            cb(res, err, 0);
        });
    }

    /**
     * @apiDefine Count
     * @apiName Count
     * @apiVersion 1.0.0
     *
     * @apiParam {Object} filter Query filter.
     *
     * @apiSuccess {Number} result Number of matched objects.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "result": 2
     *     }
     *
     */
    count(filter, user_id, res, cb) {
        var self = this;
        global.timer.get_timer('count_'+self.name).start();
        co(function *() {
            filter = yield self.attach_permissions(filter, user_id);
            var count = yield db.get().collection(self.name).count(filter);
            return count;
        }).then(function(count) {
            log.debug('found %d objects', count);
            global.timer.get_timer('count_'+self.name).stop();
            cb(res, 0, count);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('count_'+self.name).stop();
            cb(res, err, 0);
        });
    }

    /**
     * @apiDefine Commit
     * @apiName Commit
     * @apiVersion 1.0.0
     *
     * @apiParam {Object[]} objs List of objects to commit.
     * @apiParam {Object} [objs.content] Any extra content (e.g. full problem Hamiltonian) that is too large to be queryable, i.e. >16 MB.
     *
     * @apiSuccess {Object} result Object containing results.
     * @apiSuccess {Number} result.n_existing Number of existing objects that would have been duplicated.
     * @apiSuccess {Number} result.n_new Number of new objects committed.
     * @apiSuccess {String[]} result.ids IDs of both duplicate and new objects.
     * @apiSuccess {String} result.commit_tag Unique identifier for objects either touched or committed with this POST.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "result": {
     *         "n_existing": 0,
     *         "n_new": 1,
     *         "ids": ["0f1f0asd3"],
     *         "commit_tag": "13g0h3fhf"
     *       }
     *     }
     *
     */
    commit(objs, user_id, res, cb) {
        var self = this;
        global.timer.get_timer('commit_'+self.name).start();
        co(function *() {
            if (objs.length === 0)
                return {"n_existing": 0, "n_new": 0, "ids": []};

            objs = yield self.attach_permissions(objs, user_id);
            objs = yield self.validate(objs, user_id);
            objs = yield self.form_ids(objs, user_id);

            global.timer.get_timer('commit_form_commit_'+self.name).start();
            if (self.name === "users") {
                for(var i=0; i<objs.length; i++) {
                    objs[i]['owner'] = objs[i]._id;
                }
            }
            for(var i=0; i<objs.length; i++) {
                objs[i].created = new Date().getTime();
            }
            var batch = db.get().collection(self.name).initializeUnorderedBulkOp();
            var ids = [];
            var commit_tag = new ObjectID();
            for(var i=0; i<objs.length; i++) {
                ids.push(objs[i]['_id']);
                batch.find({_id: objs[i]._id}).upsert().updateOne({
                    "$setOnInsert": common.omit(objs[i], 'content'),
                    "$set": {
                        "commit_tag": commit_tag,
                        "has_content": 0,
                        "updated": new Date().getTime()
                    },
                });
            }
            global.timer.get_timer('commit_form_commit_'+self.name).stop();

            global.timer.get_timer('commit_commit_'+self.name).start();
            var result = yield batch.execute();
            global.timer.get_timer('commit_commit_'+self.name).stop();

            for(var i=0; i<objs.length; i++) {
                if (objs[i].hasOwnProperty('content')) {
                    var id = yield commit_gridfs_obj(objs[i]._id, objs[i].content);
                    db.get().collection(self.name).updateOne({"_id": id}, {"$set": {"has_content": 1}}, {w:1}, function(err, result) {});
                }
            }
            global.timer.get_timer('commit_'+self.name).stop();
            return {"n_existing": result.nMatched, "n_new": result.nUpserted, 'ids': ids, 'commit_tag': commit_tag};
        }).then(function(result) {
            global.timer.get_timer('commit_'+self.name).stop();
            cb(res, 0, result);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('commit_'+self.name).stop();
            cb(res, err, 0);
        });
    }

    /**
     * @apiDefine CommitOne
     * @apiName CommitOne
     * @apiVersion 1.0.0
     *
     * @apiParam {Object} content Any extra content (e.g. full problem Hamiltonian) that is too large to be queryable, i.e. >16 MB.
     *
     * @apiSuccess {Object} result Object containing results.
     * @apiSuccess {Number} result.n_existing Number of existing objects that would have been duplicated.
     * @apiSuccess {Number} result.n_new Number of new objects committed.
     * @apiSuccess {String[]} result.ids IDs of both duplicate and new objects.
     * @apiSuccess {String} result.commit_tag Unique identifier for objects either touched or committed with this POST.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "result": {
     *         "n_existing": 0,
     *         "n_new": 1,
     *         "ids": ["0f1f0asd3"],
     *         "commit_tag": "13g0h3fhf"
     *       }
     *     }
     *
     */
    commit_one(obj, user_id, res, cb) {
        var self = this;
        global.timer.get_timer('commit_one'+self.name).start();
        self.commit([obj], user_id, res, cb);
        global.timer.get_timer('commit_one'+self.name).stop();
    }

    /**
     * @apiDefine Update
     * @apiName Update
     * @apiVersion 1.0.0
     *
     * @apiParam {Object} filter Query filter.
     * @apiParam {Object} update Update operation.
     *
     * @apiSuccess {Number} result Number of updated objects.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "result": 1
     *     }
     *
     */
    update(filter, update, user_id, res, cb) {
        var self = this;
        global.timer.get_timer('update_'+self.name).start();
        co(function *() {
            filter = yield self.attach_permissions(filter, user_id);
            var result = yield db.get().collection(self.name).updateMany(filter, {'$set':update}, {w:1});
            return result.modifiedCount;
        }).then(function(count) {
            log.debug('updated %d objects', count);
            global.timer.get_timer('update_'+self.name).stop();
            cb(res, 0, count);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('update_'+self.name).stop();
            cb(res, err, 0);
        });
    }

    /**
     * @apiDefine UpdateOne
     * @apiName UpdateOne
     * @apiVersion 1.0.0
     *
     * @apiParam {Object} filter Query filter.
     * @apiParam {Object} update Update operation.
     *
     * @apiSuccess {Number} result Number of updated objects.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "result": {
     *         _id: "13fjh013fj",
     *         my: "information"
     *     }
     *
     */
    update_one(filter, update, user_id, res, cb) {
        var self = this;
        global.timer.get_timer('update_one_'+self.name).start();
        co(function *() {
            filter = yield self.attach_permissions(filter, user_id);
            var result = yield db.get().collection(self.name).findOneAndUpdate(filter, {$set:update}, {w:1});
            if (!result.value) return 0;
            return result.value;
        }).then(function(obj) {
            log.debug('updated object');
            global.timer.get_timer('update_one_'+self.name).stop();
            cb(res, 0, obj);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('update_one_'+self.name).stop();
            cb(res, err, 0);
        });
    }

    /**
     * @apiDefine Replace
     * @apiName Replace
     * @apiVersion 1.0.0
     *
     * @apiParam {Object[]} objs List of objects to replace their previous versions.
     *
     * @apiSuccess {Object} result Number of replaced objects.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "result": 1
     *     }
     *
     */
    replace(objs, user_id, res, cb) {
        var self = this;
        global.timer.get_timer('replace_'+self.name).start();
        co(function *() {
            var batch = [];
            for(var i=0; i<objs.length; i++) {
                var id = objs[i]._id;
                delete objs[i]._id;
                batch.push({ replaceOne: { filter: {_id: id}, replacement: objs[i] } });
            }
            var result = yield db.get().collection(self.name).bulkWrite(batch, {w:1});
            if (!result.ok) throw "BulkWrite error";
            log.debug('replaced %d objects', result.modifiedCount);
            global.timer.get_timer('replace_'+self.name).stop();
            cb(res, 0, result.modifiedCount);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('replace_'+self.name).stop();
            cb(res, err, 0);
        });
    }

    /**
     * @apiDefine Pop
     * @apiName Pop
     * @apiVersion 1.0.0
     *
     * @apiParam {Object} filter Query filter.
     *
     * @apiSuccess {Object} result Popped object.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "result": {
     *         "_id": "109jf03fj3",
     *         "name": "myObject",
     *         "myKey": "myValue"
     *     }
     *
     */
    pop(filter, sort, user_id, res, cb) {
        var self = this;
        global.timer.get_timer('pop_'+self.name).start();
        co(function *() {
            filter = yield self.attach_permissions(filter, user_id);
            var result = yield db.get().collection(self.name).findOneAndDelete(filter, {sort: sort});
            if (!result.value) return 0;
            return result.value;
        }).then(function(obj) {
            log.debug('popped 1 objects');
            global.timer.get_timer('pop_'+self.name).stop();
            cb(res, 0, obj);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('pop_'+self.name).stop();
            cb(res, err, 0);
        });
    }

    /**
     * @apiDefine Delete
     * @apiName Delete
     * @apiVersion 1.0.0
     *
     * @apiParam {Object} filter Query filter.
     *
     * @apiSuccess {Number} result Number of deleted objects.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "result": 1
     *     }
     *
     */
    delete(filter, user_id, res, cb) {
        var self = this;
        global.timer.get_timer('delete_'+self.name).start();
        co(function *() {
            filter = yield self.attach_permissions(filter, user_id);
            var fields = ['_id', 'has_content'];
            var objs = yield query(self, filter, fields, user_id);
            for (var i=0; i<objs.length; i++) {
                if (objs[i].has_content) {
                    delete_gridfs_by_id(objs[i]._id);
                }
            }
            var result = yield db.get().collection(self.name).deleteMany(filter, {});
            return result.deletedCount;
        }).then(function(count) {
            log.debug('deleted %d objects', count);
            global.timer.get_timer('delete_'+self.name).stop();
            cb(res, 0, count);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('delete_'+self.name).stop();
            cb(res, err, 0);
        });
    }

    /**
     * @apiDefine Stats
     * @apiName Stats
     * @apiVersion 1.0.0
     *
     * @apiParam {Object} filter Query filter.
     * @apiParam {String} field Field on which to compute statistics.
     *
     *
     * @apiSuccess {Object} result Statistics object.
     * @apiSuccess {Number} result.diff Total variance of field.
     * @apiSuccess {Number} result.sum Total of field.
     * @apiSuccess {Number} result.count Number of matching objects.
     * @apiSuccess {Number} result.min Minimum of field.
     * @apiSuccess {Number} result.max Maximum of field.
     * @apiSuccess {Number} result.mean Mean of field.
     * @apiSuccess {Number} result.variance Variance of field.
     * @apiSuccess {Number} result.stddev Standard deviation of field.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "result": {
     *         'diff': 0,
     *         'sum': 4,
     *         'count': 1,
     *         'min': 4,
     *         'max': 4,
     *         'mean': 4,
     *         'variance': 0,
     *         'stddev': 0
     *       }
     *     }
     *
     */
    stats(filter, field, map, user_id, res, cb) {
        var self = this;
        global.timer.get_timer('stats_'+self.name).start();
        co(function *() {
            filter = yield self.attach_permissions(filter, user_id);
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
            o.out = {replace: 'statistics' + '_' + field + '_' + self.name};
            var out_collection = yield db.get().collection(self.name).mapReduce(map, reduce, o);
            var result = yield out_collection.find().toArray();
            if(result.length === 0)
                return {'diff':0,'sum':0,'count':0,'min':0,'max':0,'mean':0,'variance':0,'stddev':0};
            else
                return result[0].value;
        }).then(function(obj) {
            global.timer.get_timer('stats_'+self.name).stop();
            cb(res, 0, obj);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('stats_'+self.name).stop();
            cb(res, err, 0);
        });
    }

    /**
     * @apiDefine Distinct
     * @apiName Distinct
     * @apiVersion 1.0.0
     *
     * @apiParam {Object} filter Query filter.
     * @apiParam {String[]} fields Field on which to determine distinctness.
     *
     * @apiParamExample {json} Request-Example:
     *     {
     *       "filter": {},
     *       "fields": ["n_spins"]
     *     }
     *
     * @apiSuccess {Object} result Object containing distinct values.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "result": [4, 5, 6]
     *     }
     *
     */
    distinct(filter, fields, user_id, res, cb) {
        var self = this;
        global.timer.get_timer('distinct_'+self.name).start();
        co(function *() {
            filter = self.attach_permissions(filter, user_id);
            var objs = yield db.get().collection(self.name).distinct(fields, filter);
            return objs;
        }).then(function(objs) {
            global.timer.get_timer('distinct_'+self.name).stop();
            cb(res, 0, objs);
        }).catch(function(err) {
            log.error(err);
            global.timer.get_timer('distinct_'+self.name).stop();
            cb(res, err, 0);
        });
    }

}

module.exports = Collection;
