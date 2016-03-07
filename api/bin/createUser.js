var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var db = require(libs + 'db/mongo');
var common = require(libs + 'routes/common');
var pass = require(libs + 'auth/pass');

db.connect(function(err) {
    if(!err) {
        var salt = pass.generate_salt();
        var password = process.argv[3];
        var user = {
            username: process.argv[2],
            email: process.argv[4],
            salt: salt,
            hashed_password: pass.encrypt_password(salt, password),
        };
        common.commit(db.get().collection('users'), [user], "", {}, function(res, err, result) {
            if(!err) {
                log.info("New user - %s:%s:%s", user.username, password, user.email);
            } else {
                log.error(err);
            }
            db.close();
        });
    }
});
