var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var methodOverride = require('method-override');

var libs = process.cwd() + '/libs/';
require(libs + 'auth/auth');

var config = require('./config');
var log = require('./log')(module);
var oauth2 = require('./auth/oauth2');

var api = require('./routes/api');
var users = require('./routes/users');
var models = require('./routes/models');
var executables = require('./routes/executables');
var properties = require('./routes/properties');

var app = express();

app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, "public")));

app.use('/api', api);
app.use('/api/users', users);
app.use('/api/models', models);
app.use('/api/executables', executables);
app.use('/api/properties', properties);
app.use('/api/oauth/token', oauth2.token);

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
