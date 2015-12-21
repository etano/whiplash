var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var libs = process.cwd() + '/libs/';
var config = require(libs + 'config');
var User = require(libs + 'schemas/user');
var Client = require(libs + 'schemas/client');
var AccessToken = require(libs + 'schemas/accessToken');
var RefreshToken = require(libs + 'schemas/refreshToken');

passport.use(new BasicStrategy(
    function(username, password, done) {
        Client.findOne({ clientId: username }, function(err, client) {
            if (err) { return done(err); }

            if (!client) { return done(null, false, { message: 'Wrong username or password' }); }

            if (client.clientSecret !== password) { return done(null, false, { message: 'Wrong username or password' }); }

            return done(null, client);
        });
    }
));

passport.use(new ClientPasswordStrategy(
    function(clientId, clientSecret, done) {
        Client.findOne({ clientId: clientId }, function(err, client) {
            if (err) { return done(err); }

            if (!client) { return done(null, false, { message: 'Wrong client id or secret' }); }

            if (client.clientSecret !== clientSecret) { return done(null, false, { message: 'Wrong client id or secret' }); }

            return done(null, client);
        });
    }
));

passport.use(new BearerStrategy(
    function(accessToken, done) {
        AccessToken.findOne({ token: accessToken }, function(err, token) {
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

            User.findById(token.userId, function(err, user) {
                if (err) { return done(err); }

                if (!user) { return done(null, false, { message: 'Unknown user' }); }

                var info = { scope: '*' };
                done(null, user, info);
            });
        });
    }
));
