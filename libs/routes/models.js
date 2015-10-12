var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

var db = require(libs + 'db/mongoose');
var Model = require(libs + 'model/model');

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    Model.find(function (err, models) {
        if (!err) {
            return res.json(models);
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var model = new Model({
        class: req.body.class,
        owner: req.body.owner,
        description: req.body.description,
        cfg: req.body.cfg
    });

    model.save(function (err) {
        if (!err) {
            log.info("New model created with id: %s", model.id);
            return res.json({
                status: 'OK',
                model:model
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
    Model.findById(req.params.id, function (err, model) {
        if(!model) {
            res.statusCode = 404;
            return res.json({ error: 'Not found' });
        }
        if (!err) {
            return res.json({
                status: 'OK',
                model:model
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

router.put('/:id', passport.authenticate('bearer', { session: false }), function (req, res){
    var modelId = req.params.id;

    Model.findById(modelId, function (err, model) {
        if(!model) {
            res.statusCode = 404;
            log.error('Model with id: %s Not Found', modelId);
            return res.json({ error: 'Not found' });
        }

        model.class = req.body.class;
        model.owner = req.body.owner;
        model.description = req.body.description;
        model.cfg = req.body.cfg;
        model.save(function (err) {
            if (!err) {
                log.info("Model with id: %s updated", model.id);
                return res.json({
                    status: 'OK',
                    model:model
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
