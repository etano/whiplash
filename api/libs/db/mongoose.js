var mongoose = require('mongoose');

var libs = process.cwd() + '/libs/';

var log = require(libs + 'log')(module);
var config = require(libs + 'config');

var options = {
    user: process.env.MONGO_API_USERNAME,
    pass: process.env.MONGO_API_PASSWORD
};
mongoose.connect("mongodb://"+process.env.MONGO_PORT_27017_TCP_ADDR+":"+process.env.MONGO_PORT_27017_TCP_PORT+"/wdb",options);

var db = mongoose.connection;

db.on('error', function (err) {
    log.error('Connection error:', err.message);
});

db.once('open', function callback () {
    log.info("Connected to DB!");
});

module.exports = mongoose;
