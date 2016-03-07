var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var libs = process.cwd() + '/libs/';
var config = require(libs + 'config');
var common = require(libs + 'routes/common');
var db = require(libs + 'db/mongo');
var users = db.get().collection('users');
var access_tokens = db.get().collection('accesstokens');
var clients = db.get().collection('clients');

passport.use(new BasicStrategy(
    function(username, password, done) {
        common.query_one(clients, {'clientId': username}, [], "passport", {}, function(res, err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false, { message: 'Wrong username or password' }); }
            if (client.clientSecret !== password) { return done(null, false, { message: 'Wrong username or password' }); }
            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        common.query_one(clients, {'clientId': clientId}, [], "passport", {}, function(res, err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false, { message: 'Wrong client id or secret' }); }
            if (client.clientSecret !== clientSecret) { return done(null, false, { message: 'Wrong client id or secret' }); }
            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function(access_token, done) {
        common.query_one(access_tokens, {'token': access_token}, [], "passport", {}, function(res, err, token) {
            if (err) { return done(err); }
            if (!token) {  return done(null, false); }
            // Tokens don't expire when this is commented out
            //
            //if( Math.round((Date.now()-token.created)/1000) > config.get('security:tokenLife') ) {
            //    AccessToken.remove({ token: accessToken }, function (err) {
            //        if (err) { return done(err); }
            //    });
            //    return done(null, false, { message: 'Token expired' });
            //}
            common.query_one(users, {'_id': token.userId}, [], "passport", {}, function(res, err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false, { message: 'Unknown user' }); }
                var info = { scope: '*' };
                done(null, user, info);
            });
        });
    }
));
