var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://"+process.env.MONGO_API_USERNAME+":"+process.env.MONGO_API_PASSWORD+"@"+process.env.MONGO_PORT_27017_TCP_ADDR+":"+process.env.MONGO_PORT_27017_TCP_PORT+"/wdb";

var state = {
    db: null,
};

exports.connect = function(done) {
    if (state.db) {
        log.info("Already connected to database!");
        return done();
    }

    MongoClient.connect(url, function(err, db) {
        if (err) {
            log.error("Error connecting to database: %s",err);
            return done(err);
        }
        state.db = db;
        log.info("Connected to database!");
        done();
    });
};

exports.get = function() {
    return state.db;
};

exports.close = function() {
    if (state.db) {
        state.db.close(function(err, result) {
          state.db = null;
          state.mode = null;
        });
    }
};
