var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var db = require(libs + 'db/mongo');
var User = require(libs + 'schemas/user');

db.connect(function(err) {
    if(!err) {
        var user = new User({
            username: process.argv[2],
            password: process.argv[3]
        });

        user.validateSync();
        db.get().collection('users').insertOne(user.toObject(), function(err, res) {
            if(!err) {
                log.info("New user - %s:%s", user.username, user.password);
            } else {
                log.error(err);
            }
            db.close();
        });
    }
});
