var oauth2orize = require('oauth2orize');
var passport = require('passport');
var crypto = require('crypto');
var co = require('co');
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
var generate_tokens = function (user, client_id) {
    return new Promise(function(resolve, reject) {
        co(function *() {
            var data = { client_id: client_id };
            var count = yield RefreshTokens.delete(data, user);
            count = yield AccessTokens.delete(data, user);
            var access_token_value = crypto.randomBytes(32).toString('hex');
            var refresh_token_value = crypto.randomBytes(32).toString('hex');
            data.token = access_token_value;
            var result = yield AccessTokens.commit_one(data, user);
            data.token = refresh_token_value;
            result = yield RefreshTokens.commit_one(data, user);
            resolve({
                access_token: access_token_value,
                refresh_token: refresh_token_value,
                message: {
                    expires_in: config.get('security:tokenLife')
                }
            });
        }).catch(function(err) {
            log.error(err);
            reject(err);
        });
    });
};

// Exchange username & password for access token.
aserver.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done) {
    co(function *() {
        var user = yield Users.query_one({'username': username}, [], {username: "admin"});
        if (!user || !pass.check_password(user.salt, password, user.hashed_password))
            throw "Bad user/pass";
        var tokens = yield generate_tokens(user, client.client_id);
        return tokens;
    }).then(function(tokens) {
        done(null, tokens.access_token, tokens.refresh_token, tokens.message);
    }).catch(function(err) {
        log.error(err);
        return done(null, false);
    });
}));

// Exchange refreshToken for access token.
aserver.exchange(oauth2orize.exchange.refreshToken(function(client, refresh_token, scope, done) {
    co(function *() {
        var token = yield RefreshTokens.query_one({token: refresh_token, client_id: client.client_id}, [], {username: "admin"});
        if (!token) throw "No token";

        var user = yield Users.query_one({_id: token.owner}, [], {username: "admin"});
        if (!user) throw "No user";

        var tokens = yield generate_tokens(user, client.client_id);
        return tokens;
    }).then(function(tokens) {
        done(null, tokens.access_token, tokens.refresh_token, tokens.message);
    }).catch(function(err) {
        log.error(err);
        return done(null, false);
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
