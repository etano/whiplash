var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

module.exports = {

    //
    // Commit
    //

    commit: function(ObjType,req,res) {
        // TODO: Bulk inserts with validation for performance.

        ObjType.count({}, function(err,count) {
            for(var i=0; i<req.body.length; i++) {
                req.body[i].owner = req.user._id;
            }
            ObjType.create(req.body, function(err,objs) {
                if (!err) {
                    log.info("%s new objects created", String(objs.length));
                    var ids = [];
                    for(var i=0; i<objs.length; i++) {
                        ids.push(objs[i]["_id"]);
                    }
                    return res.json({
                        status: 'OK',
                        ids: ids
                    });
                } else {
                    if(err.name === 'ValidationError') {
                        res.statusCode = 400;
                        res.json({ error: err.toString() });
                    } else {
                        res.statusCode = 500;
                        res.json({ error: 'Server error' });
                    }
                    log.error('Internal error(%d): %s', res.statusCode, err.message);
                }
            });

        });
    },

    //
    // Query
    //

    query: function(ObjType,req,res) {
        ObjType.find(req.body, function (err, objs) {
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
        ObjType.findOne(req.body, function (err, obj) {
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
        ObjType.count(req.body, function (err, count) {

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
        ObjType.find(req.body, req.params.field, function (err, objs) {
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
        ObjType.findById(req.params.id, function (err, obj) {
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
    // Update
    //

    update: function(ObjType,req,res) {
        ObjType.update(req.body.filter, req.body.update, function (err, raw) {
            if (!err) {
                return res.json({status: 'OK'});
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    update_one: function(ObjType,req,res) {
        req.body.filter.owner = req.user._id;
        ObjType.findOneAndUpdate(req.body.filter, req.body.update, {new: true}, function (err, obj) {
            // Check exists
            if(!obj) {
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }

            // Update
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

    update_id: function(ObjType,req,res) {
        var filter = {"_id": req.params.id,"owner":req.user._id};
        ObjType.update(filter, req.body, function (err, raw) {
            if (!err) {
                return res.json({status: 'OK'});
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    //
    // Delete
    //

    delete: function(ObjType,req,res) {
        var filter = req.body;
        filter.owner = req.user._id;
        ObjType.remove(filter, function (err, raw) {
            if (!err) {
                return res.json({status: 'OK'});
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
