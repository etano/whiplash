var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;

var user = "scheduler";
var pass = process.env.MONGO_SCHEDULER_PASSWORD;
var mongo_url = process.env.MONGO_PORT_27017_TCP_ADDR;
var mongo_port = process.env.MONGO_PORT_27017_TCP_PORT;

var state = {
    db: null,
};

exports.ObjectID = ObjectID;

exports.init = function() {

    var url = "mongodb://"+mongo_url+":"+mongo_port+"/wdb";

    // Add scheduler user
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log("Error connecting to database: ", err.message);
        } else {
            db.addUser(user, pass, {roles:[{role:"readWrite", db:"wdb"}]}, function (err, result) {
                if (err) {
                    console.log("Error creating %s user", user, err.message);
                } else {
                    console.log(result);
                }
                db.close();
            });
        }
    });

    // Create necessary collections and indexes
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log("Error connecting to database: ", err.message);
        } else {
            db.createCollection("todo", {}, function(err, collection) {
                if (err) {
                    console.log(err.message);
                } else {
                    console.log("Created todo collection");
                }
                db.close();
            });
        }
    });
};

exports.connect = function(done) {
    if (state.db) {
        console.log("Already connected to database!");
        return done();
    }

    var url = "mongodb://"+user+":"+pass+"@"+mongo_url+":"+mongo_port+"/wdb";
    MongoClient.connect(url, function(err, db) {
        if (err) {
            console.log("Error connecting to database: ", err.message);
            return done(err);
        }
        state.db = db;
        console.log("Connected to database!");
        done();
    });

};

exports.get = function() {
    return state.db;
};

exports.close = function() {
    if (state.db) {
        state.db.close(function(err, result) {
          console.log("Disconnected from database!");
          state.db = null;
          state.mode = null;
        });
    }
};
