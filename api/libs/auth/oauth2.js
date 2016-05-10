var oauth2orize = require('oauth2orize');
var passport = require('passport');
var crypto = require('crypto');
var libs = process.cwd() + '/libs/';
var config = require(libs + 'config');
var log = require(libs + 'log')(module);
var db = require(libs + 'db/mongo');
var common = require(libs + 'routes/common');
var pass = require(libs + 'auth/pass');

// create OAuth 2.0 server
var aserver = oauth2orize.createServer();

// Destroys any old tokens and generates a new access and refresh token
var generate_tokens = function (user_id, client_id, done) {
    var data = { clientId: client_id };
    common.delete(db.get().collection('refreshtokens'), data, user_id, {}, function(res, err, count) {
        if (err) { return done(err); }
        common.delete(db.get().collection('accesstokens'), data, user_id, {}, function(res, err, count) {
            if (err) { return done(err); }
            var access_token_value = crypto.randomBytes(32).toString('hex');
            var refresh_token_value = crypto.randomBytes(32).toString('hex');
            data.token = access_token_value;
            common.commit(db.get().collection('accesstokens'), [data], user_id, {}, function(res, err, result) {
                if (err) { return done(err); }
                data.token = refresh_token_value;
                common.commit(db.get().collection('refreshtokens'), [data], user_id, {}, function(res, err, result) {
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
    common.query_one(db.get().collection('users'), {'username': username}, [], "user_admin", {}, function(res, err, user) {
        if (err) { return done(err); }
        if (!user || !pass.check_password(user.salt, password, user.hashed_password)) {
            return done(null, false);
        }
        generate_tokens(user._id, client.clientId, done);
    });
}));

// Exchange refreshToken for access token.
aserver.exchange(oauth2orize.exchange.refreshToken(function(client, refresh_token, scope, done) {
    common.query_one(db.get().collection('refreshtokens'), {token: refresh_token, clientId: client.clientId}, [], "user_admin", {}, function(res, err, token) {
        if (err) { return done(err); }
        if (!token) { return done(null, false); }
        common.query_one(db.get().collection('users'), {_id: token.owner}, [], token.owner, {}, function(res, err, user) {
            if (err) { return done(err); }
            if (!user) { return done(null, false); }
            generate_tokens(user._id, client.clientId, done);
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
