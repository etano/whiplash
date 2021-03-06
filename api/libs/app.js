var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var passport = require('passport');
var methodOverride = require('method-override');

var libs = process.cwd() + '/libs/';
require(libs + 'auth/auth');

var config = require('./config');
var log = require('./log')(module);

var api = require('./routes/api');
var users = require('./routes/users');
var timer = require('./routes/timer');
var accesstokens = require('./routes/accesstokens');
var clients = require('./routes/clients');
var models = require('./routes/models');
var sets = require('./routes/sets');
var executables = require('./routes/executables');
var properties = require('./routes/properties');
var queries = require('./routes/queries');
var work_batches = require('./routes/work_batches');
var oauth2 = require('./auth/oauth2');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

var app = express();
app.use(compression());
app.use(bodyParser.json({limit: '1024mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride());
app.use(allowCrossDomain);
app.use(passport.initialize());

app.use('/api', api);
app.use('/api/users', users);
app.use('/api/accesstokens', accesstokens);
app.use('/api/users/token', oauth2.token);
app.use('/api/clients', clients);
app.use('/api/models', models);
app.use('/api/sets', sets);
app.use('/api/timer', timer);
app.use('/api/executables', executables);
app.use('/api/properties', properties);
app.use('/api/queries', queries);
app.use('/api/work_batches', work_batches);

// catch 404 and forward to error handler
app.use(function(req, res, next){
    res.status(404);
    log.debug('%s %d %s', req.method, res.statusCode, req.url);
    res.json({ error: 'Not found' });
    return;
});

// error handlers
app.use(function(err, req, res, next){
    res.status(err.status || 500);
    log.error('%s %d %s', req.method, res.statusCode, err.message);
    res.json({ error: err.message });
    return;
});

module.exports = app;
