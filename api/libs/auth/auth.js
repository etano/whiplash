var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var libs = process.cwd() + '/libs/';
var config = require(libs + 'config');
var common = require(libs + 'routes/common');
var Users = require(libs + 'collections/users');
var AccessTokens = require(libs + 'collections/access_tokens');
var Clients = require(libs + 'collections/clients');

passport.use(new BasicStrategy(
    function(username, password, done) {
        Users.query_one({'username': username}, [], "admin", {}, function(res, err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false, { message: 'Wrong username or password' }); }
            if (!pass.check_password(user.salt, password, user.hashed_password)) { return done(null, false, { message: 'Wrong username or password' }); }
            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        Clients.query_one({'clientId': clientId}, [], "admin", {}, function(res, err, client) {
            if (err) { return done(err); }
            if (!client) { return done(null, false, { message: 'Wrong client id or secret' }); }
            if (client.clientSecret !== clientSecret) { return done(null, false, { message: 'Wrong client id or secret' }); }
            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function(access_token, done) {
        AccessTokens.query_one({'token': access_token}, [], "admin", {}, function(res, err, token) {
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
            Users.query_one({'_id': token.owner}, [], token.owner, {}, function(res, err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false, { message: 'Unknown user' }); }
                var info = { scope: '*' };
                done(null, user, info);
            });
        });
    }
));
