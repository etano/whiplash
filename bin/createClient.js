var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var db = require(libs + 'db/mongoose');
var Client = require(libs + 'schemas/client');

var client = new Client({
    name: process.argv[2],
    clientId: process.argv[3],
    clientSecret: process.argv[4]
});

client.save(function(err, client) {
    if(!err) {
        log.info("New client - %s:%s", client.clientId, client.clientSecret);
    }else {
        return log.error(err);
    }
});

setTimeout(function() {
    db.disconnect();
}, 3000);
