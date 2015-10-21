var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var db = require(libs + 'db/mongoose');
var User = require(libs + 'schemas/user');

var user = new User({
    username: process.argv[2],
    password: process.argv[3]
});

user.save(function(err, user) {
    if(!err) {
        log.info("New user - %s:%s", user.username, user.password);
    }else {
        return log.error(err);
    }
});

setTimeout(function() {
    db.disconnect();
}, 3000);
