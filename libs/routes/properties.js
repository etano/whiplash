var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

var db = require(libs + 'db/mongoose');
var Property = require(libs + 'model/property');

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    Property.find(function (err, propertys) {
        if (!err) {
            return res.json(propertys);
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var property = new Property({
        class: req.body.class,
        owner: req.body.owner,
        model_id: req.body.model_id,
        executable_id: req.body.executable_id,
        status: req.body.status,
        seed: req.body.seed,
        cfg: req.body.cfg
    });

    property.save(function (err) {
        if (!err) {
            log.info("New property created with id: %s", property.id);
            return res.json({
                status: 'OK',
                property:property
            });
        } else {
            if(err.name === 'ValidationError') {
                res.statusCode = 400;
                res.json({ error: 'Validation error' });
            } else {
                res.statusCode = 500;
                res.json({ error: 'Server error' });
            }
            log.error('Internal error(%d): %s', res.statusCode, err.message);
        }
    });
});

router.get('/:id', passport.authenticate('bearer', { session: false }), function(req, res) {
    Property.findById(req.params.id, function (err, property) {
        if(!property) {
            res.statusCode = 404;
            return res.json({ error: 'Not found' });
        }
        if (!err) {
            return res.json({
                status: 'OK',
                property:property
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

router.put('/:id', passport.authenticate('bearer', { session: false }), function (req, res){
    var propertyId = req.params.id;

    Property.findById(propertyId, function (err, property) {
        if(!property) {
            res.statusCode = 404;
            log.error('Property with id: %s Not Found', propertyId);
            return res.json({ error: 'Not found' });
        }

        property.class = req.body.class;
        property.owner = req.body.owner;
        property.model_id = req.body.model_id;
        property.executable_id = req.body.executable_id;
        property.status = req.body.status;
        property.seed = req.body.seed;
        property.cfg = req.body.cfg;
        property.save(function (err) {
            if (!err) {
                log.info("Property with id: %s updated", property.id);
                return res.json({
                    status: 'OK',
                    property:property
                });
            } else {
                if(err.name === 'ValidationError') {
                    res.statusCode = 400;
                    return res.json({ error: 'Validation error' });
                } else {
                    res.statusCode = 500;
                    return res.json({ error: 'Server error' });
                }
                log.error('Internal error (%d): %s', res.statusCode, err.message);
            }
        });
    });
});

module.exports = router;
