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
var co = require('co');

var collections = [AccessTokens, Clients, Executables, Models, Properties, Queries, RefreshTokens, Users, WorkBatches];

var api_user = "api";
var api_pass = process.env.MONGO_API_PASSWORD;
var api_url = process.env.MONGO_PORT_27017_TCP_ADDR;
var api_port = process.env.MONGO_PORT_27017_TCP_PORT;

var state = {
    db: null,
};

exports.init = function(done) {

    var url = "mongodb://"+api_url+":"+api_port+"/wdb";
    log.info("Attempting to connect to "+api_url+":"+api_port+"/wdb");

    MongoClient.connect(url, function(err, db) {
        if (!err) {
            co(function *() {
                // Create necessary collections and indexes
                for (var i=0; i<collections.length; i++) {
                    var collection = yield db.createCollection(collections[i].name, {});
                    for (var j=0; j<collections[i].indexes.length; j++) {
                        var index_result = yield collection.createIndex(collections[i].indexes[j].fieldOrSpec, collections[i].indexes[j].options);
                    }
                }

                // Add API user
                var user_result = yield db.addUser(api_user, api_pass, {roles:[{role:"readWrite",db:"wdb"}]});

                // Close database
                db.close();
                done();
            }).catch(function(err) {
                db.close();
                log.error("Error in initializing database!", err);
                done();
            });
        } else {
            log.error("Error connecting to database!", err);
        }
    });

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
