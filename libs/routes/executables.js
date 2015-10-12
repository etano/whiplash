var express = require('express');
var passport = require('passport');
var router = express.Router();

var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

var db = require(libs + 'db/mongoose');
var Executable = require(libs + 'model/executable');

router.get('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    Executable.find(function (err, executables) {
        if (!err) {
            return res.json(executables);
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

router.post('/', passport.authenticate('bearer', { session: false }), function(req, res) {
    var executable = new Executable({
        class: req.body.class,
        name: req.body.name,
        owner: req.body.owner,
        description: req.body.description,
        algorithm: req.body.algorithm,
        version: req.body.version,
        build: req.body.build,
        cfg: req.body.cfg
    });

    executable.save(function (err) {
        if (!err) {
            log.info("New executable created with id: %s", executable.id);
            return res.json({
                status: 'OK',
                executable:executable
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
    Executable.findById(req.params.id, function (err, executable) {
        if(!executable) {
            res.statusCode = 404;
            return res.json({ error: 'Not found' });
        }
        if (!err) {
            return res.json({
                status: 'OK',
                executable:executable
            });
        } else {
            res.statusCode = 500;
            log.error('Internal error(%d): %s',res.statusCode,err.message);
            return res.json({ error: 'Server error' });
        }
    });
});

router.put('/:id', passport.authenticate('bearer', { session: false }), function (req, res){
    var executableId = req.params.id;

    Executable.findById(executableId, function (err, executable) {
        if(!executable) {
            res.statusCode = 404;
            log.error('Executable with id: %s Not Found', executableId);
            return res.json({ error: 'Not found' });
        }

        executable.class = req.body.class;
        executable.name = req.body.name;
        executable.owner = req.body.owner;
        executable.description = req.body.description;
        executable.algorithm = req.body.algorithm;
        executable.version = req.body.version;
        executable.build = req.body.build;
        executable.cfg = req.body.cfg;
        executable.save(function (err) {
            if (!err) {
                log.info("Executable with id: %s updated", executable.id);
                return res.json({
                    status: 'OK',
                    executable:executable
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
