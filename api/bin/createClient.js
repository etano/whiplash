var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var db = require(libs + 'db/mongo');
var common = require(libs + 'routes/common');

db.connect(function(err) {
    if(!err) {
        var client = {
            name: process.argv[2],
            clientId: process.argv[3],
            clientSecret: process.argv[4]
        };
        common.commit(db.get().collection('clients'), [client], "", {}, function(res, err, result) {
            if(!err) {
                log.info("New client - %s:%s", client.clientId, client.clientSecret);
            } else {
                log.error(err);
            }
            db.close();
        });
    }
});
