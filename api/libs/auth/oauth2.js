var oauth2orize = require('oauth2orize');
var passport = require('passport');
var crypto = require('crypto');
var libs = process.cwd() + '/libs/';
var config = require(libs + 'config');
var log = require(libs + 'log')(module);
var pass = require(libs + 'auth/pass');
var Users = require(libs + 'collections/users');
var AccessTokens = require(libs + 'collections/access_tokens');
var RefreshTokens = require(libs + 'collections/refresh_tokens');

// create OAuth 2.0 server
var aserver = oauth2orize.createServer();

// Destroys any old tokens and generates a new access and refresh token
var generate_tokens = function (user, client_id, done) {
    var data = { client_id: client_id };
    RefreshTokens.delete(data, user, {}, function(res, err, count) {
        if (err) { return done(err); }
        AccessTokens.delete(data, user, {}, function(res, err, count) {
            if (err) { return done(err); }
            var access_token_value = crypto.randomBytes(32).toString('hex');
            var refresh_token_value = crypto.randomBytes(32).toString('hex');
            data.token = access_token_value;
            AccessTokens.commit([data], user, {}, function(res, err, result) {
                if (err) { return done(err); }
                data.token = refresh_token_value;
                RefreshTokens.commit([data], user, {}, function(res, err, result) {
                    if (err) { return done(err); }
                    done(null, access_token_value, refresh_token_value, {
                        'expires_in': config.get('security:tokenLife')
                    });
                });
            });
        });
    });
};

// Exchange username & password for access token.
aserver.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
    Users.query_one({'username': username}, [], {username: "admin"}, {}, function(res, err, user) {
        if (err) { return done(err); }
        if (!user || !pass.check_password(user.salt, password, user.hashed_password)) {
            return done(null, false);
        }
        generate_tokens(user, client.client_id, done);
    });
}));

// Exchange refreshToken for access token.
aserver.exchange(oauth2orize.exchange.refreshToken(function(client, refresh_token, scope, done) {
    RefreshTokens.query_one({token: refresh_token, client_id: client.client_id}, [], {username: "admin"}, {}, function(res, err, token) {
        if (err) { return done(err); }
        if (!token) { return done(null, false); }
        Users.query_one({_id: token.owner}, [], {username: "admin"}, {}, function(res, err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            generate_tokens(user, client.client_id, done);
        });
    });
}));

// token endpoint
//
// `token` middleware handles client requests to exchange authorization grants
// for access tokens.  Based on the grant type being exchanged, the above
// exchange middleware will be invoked to handle the request.  Clients must
// authenticate when making requests to this endpoint.

exports.token = [
        passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
        aserver.token(),
        aserver.errorHandler()
];

exports.generate_tokens = generate_tokens;
