var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

module.exports = {

    save: function(ObjType,req,res) {
        // TODO: Bulk inserts with validation for performance.
        ObjType.count({}, function(err,count) {
            for(var i=0; i<req.body.length; i++) {
                req.body[i].owner = req.user._id;
                req.body[i]._id = count+i;
            }
            console.log("done");
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

    find: function(ObjType,req,res) {
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

    findById: function(ObjType,req,res) {
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

    updateById: function(ObjType,req,res) {
        ObjType.findById(req.params.id, function (err, obj) {
            // Check exists
            if(!obj) {
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }

            // Check to make sure user has WRITE permissions
            if(!req.user.equals(obj.owner)) {
                log.error('Unauthorized update attempt of object %s by user %s', req.params.id,String(req.user));
                return res.json({ error: 'Unauthorized update' });
            }

            // Update
            if (!err) {
                // TODO: optimize this
                obj = req.body;
                this.save(obj,res);
                return res.json({ status: 'OK' });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    },

    deleteById: function(ObjType,req,res) {
        ObjType.findById(req.params.id, function (err, obj) {
            // Check exists
            if(!obj) {
                res.statusCode = 404;
                return res.json({ error: 'Not found' });
            }

            // Check to make sure user has WRITE permissions
            if(!req.user.equals(obj.owner)) {
                log.error('Unauthorized delete attempt of object %s by user %s', req.params.id,String(req.user));
                return res.json({ error: 'Unauthorized delete' });
            }

            // Delete
            if (!err) {
                obj.remove();
                return res.json({ status: 'OK' });
            } else {
                res.statusCode = 500;
                log.error('Internal error(%d): %s',res.statusCode,err.message);
                return res.json({ error: 'Server error' });
            }
        });
    }

};
