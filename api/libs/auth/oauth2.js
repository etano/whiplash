var oauth2orize = require('oauth2orize');
var passport = require('passport');
var crypto = require('crypto');
var libs = process.cwd() + '/libs/';
var config = require(libs + 'config');
var log = require(libs + 'log')(module);
var db = require(libs + 'db/mongo');
var common = require(libs + 'routes/common');
var users = db.get().collection('users');
var access_tokens = db.get().collection('accesstokens');
var refresh_tokens = db.get().collection('refreshtokens');
var pass = require(libs + 'auth/pass');

// create OAuth 2.0 server
var aserver = oauth2orize.createServer();

// Destroys any old tokens and generates a new access and refresh token
var generate_tokens = function (data, done) {
    common.delete(refresh_tokens, data, "passport", {}, function(res, err, count) {
        if (err) { return done(err); }
        common.delete(access_tokens, data, "passport", {}, function(res, err, count) {
            if (err) { return done(err); }
            var access_token_value = crypto.randomBytes(32).toString('hex');
            var refresh_token_value = crypto.randomBytes(32).toString('hex');
            data.token = access_token_value;
            common.commit(access_tokens, [data], "passport", {}, function(res, err, result) {
                if (err) { return done(err); }
                data.token = refresh_token_value;
                common.commit(refresh_tokens, [data], "passport", {}, function(res, err, result) {
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
    common.query_one(users, {'username': username}, [], "passport", {}, function(res, err, user) {
        if (err) { return done(err); }
        if (!user || !pass.check_password(user.salt, password, user.hashed_password)) {
            return done(null, false);
        }
        var model = {
            userId: user._id,
            clientId: client.clientId
        };
        generate_tokens(model, done);
    });
}));

// Exchange refreshToken for access token.
aserver.exchange(oauth2orize.exchange.refreshToken(function(client, refresh_token, scope, done) {
    common.query_one(refresh_tokens, {token: refresh_token, clientId: client.clientId}, [], "passport", {}, function(res, err, token) {
        if (err) { return done(err); }
        if (!token) { return done(null, false); }
        common.query_one(users, {_id: token.userId}, [], "passport", {}, function(res, err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            var model = {
                userId: user._id,
                clientId: client.clientId
            };
            generate_tokens(model, done);
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
