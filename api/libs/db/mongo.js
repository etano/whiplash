var MongoClient = require('mongodb').MongoClient;
var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);

var AccessTokens = require(libs + 'collections/access_tokens');
var Clients = require(libs + 'collections/clients');
var Executables = require(libs + 'collections/executables');
var Models = require(libs + 'collections/models');
var Properties = require(libs + 'collections/properties');
var Queries = require(libs + 'collections/queries');
var RefreshTokens = require(libs + 'collections/refresh_tokens');
var Users = require(libs + 'collections/users');
var WorkBatches = require(libs + 'collections/work_batches');

var collections = [AccessTokens, Clients, Executables, Models, Properties, Queries, RefreshTokens, Users, WorkBatches];

var api_user = "api";
var api_pass = process.env.MONGO_API_PASSWORD;
var api_url = process.env.MONGO_PORT_27017_TCP_ADDR;
var api_port = process.env.MONGO_PORT_27017_TCP_PORT;

var state = {
    db: null,
};

exports.init = function() {

    var url = "mongodb://"+api_url+":"+api_port+"/wdb";
    log.info("Attempting to connect to "+api_url+":"+api_port+"/wdb");

    // Add API user
    MongoClient.connect(url, function(err, db) {
        if (err) {
            log.error("Error connecting to database: ", err.message);
        } else {
            db.addUser(api_user, api_pass, {roles:[{role:"readWrite",db:"wdb"}]}, function (err, result) {
                if (err) {
                    log.error("Error creating API user", err.message);
                } else {
                    log.info(result);
                }
                db.close();
            });
        }
    });

    // Create necessary collections and indexes
    var create_collection = function(ind) {
        MongoClient.connect(url, function(err, db) {
            if (err) {
                log.error("Error connecting to database: ", err.message);
            } else {
                db.createCollection(collections[ind].name, {}, function(err, collection) {
                    var create_index = function(i) {
                        if (i<collections[ind].indexes.length) {
                            collection.createIndex(collections[ind].indexes[i].fieldOrSpec, collections[ind].indexes[i].options, function(err, result) {
                                if (err) {
                                    log.error("Error index", err.message);
                                } else {
                                    log.info(result);
                                }
                                create_index(i+1);
                            });
                        } else {
                            db.close();
                        }
                    };
                    create_index(0);
                });
            }
        });
    };
    for (var i=0; i<collections.length; i++) {
        create_collection(i);
    }
};

exports.connect = function(done) {
    if (state.db) {
        log.info("Already connected to database!");
        return done();
    }

    var url = "mongodb://"+api_user+":"+api_pass+"@"+api_url+":"+api_port+"/wdb";
    MongoClient.connect(url, function(err, db) {
        if (err) {
            log.error("Error connecting to database: ", err.message);
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
          log.info("Disconnected from database!");
          state.db = null;
          state.mode = null;
        });
    }
};
