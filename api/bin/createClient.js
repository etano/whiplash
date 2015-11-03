var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var db = require(libs + 'db/mongo');
var Client = require(libs + 'schemas/client');

db.connect(function(err) {
    if(!err) {
        var client = new Client({
            name: process.argv[2],
            clientId: process.argv[3],
            clientSecret: process.argv[4]
        });

        client.validateSync();
        db.get().collection('clients').insertOne(client.toObject(), function(err, res) {
            if(!err) {
                log.info("New client - %s:%s", client.clientId, client.clientSecret);
            } else {
                log.error(err);
            }
            db.close();
        });
    }
});
