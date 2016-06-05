var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var co = require('co');

var libs = process.cwd() + '/libs/';
var config = require(libs + 'config');
var common = require(libs + 'routes/common');
var Users = require(libs + 'collections/users');
var AccessTokens = require(libs + 'collections/access_tokens');
var Clients = require(libs + 'collections/clients');

passport.use(new BasicStrategy(
    function(username, password, done) {
        co(function *() {
            var user = yield Users.query_one({'username': username}, [], {username: "admin"});
            if (!user) throw "Wrong username or password";
            if (!pass.check_password(user.salt, password, user.hashed_password))
                throw "Wrong username or password";
            return user;
        }).then(function(user) {
            return done(null, user);
        }).catch(function(err) {
            log.error(err);
            return done(null, false, { message: err });
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(client_id, client_secret, done) {
        co(function *() {
            var client = yield Clients.query_one({'client_id': client_id}, [], {username: "admin"});
            if (!client)  throw "Wrong client id or secret";
            if (client.client_secret !== client_secret)
                throw "Wrong client id or secret";
            return client;
        }).then(function(client) {
            return done(null, client);
        }).catch(function(err) {
            log.error(err);
            return done(null, false, { message: err });
        });
    }
));

passport.use(new BearerStrategy(
    function(access_token, done) {
        co(function *() {
            var token = yield AccessTokens.query_one({'token': access_token}, [], {username: "admin"});
            if (!token) throw "No token found"
            // Tokens don't expire when this is commented out
            //
            //if( Math.round((Date.now()-token.created)/1000) > config.get('security:tokenLife') ) {
            //    AccessToken.remove({ token: accessToken }, function (err) {
            //        if (err) { return done(err); }
            //    });
            //    return done(null, false, { message: 'Token expired' });
            //}
            var user = yield Users.query_one({'_id': token.owner}, [], {username: "admin"});
            if (!user) throw "Unknown user";
            return user;
        }).then(function(user) {
            var info = { scope: '*' };
            done(null, user, info);
        }).catch(function(err) {
            log.error(err);
            return done(null, false, { message: err });
        });
    }
));
