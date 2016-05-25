var request_lib = require('request');

var host = process.env.WHIPLASH_API_HOST;
var port = process.env.WHIPLASH_API_PORT;
var admin_access_token = process.env.WHIPLASH_ADMIN_WWW_TOKEN;
var admin_client_secret = process.env.WHIPLASH_ADMIN_WWW_CLIENT_SECRET;
var admin_password = process.env.WHIPLASH_ADMIN_PASSWORD;

var state = {
    api: null,
};

exports.connect = function(done) {
    if (state.api) {
        console.log("Already connected to whiplash!");
        return done();
    }

    var wdb = new whiplash(host, port, admin_access_token);
    if (!admin_access_token) {
        if (!admin_password)
            admin_password = "password";
        console.log("Creating new whiplash admin token!");
        wdb.create_token('admin', admin_password, 'admin-www', admin_client_secret).then(function(access_token) {
            wdb.admin_access_token = access_token;
            state.api = wdb;
            console.log("Connected to whiplash!");
            done();
        }).catch(function(err) {
            console.log("Trouble connecting to whiplash!");
            console.log(err);
            done(err);
        })
    } else {
        state.api = wdb;
        console.log("Connected to whiplash!");
        done();
    }
};

exports.get = function() {
    return state.api;
};

class whiplash {
    constructor(host, port, admin_access_token) {
        this.host = host;
        this.port = port;
        this.admin_access_token = admin_access_token;
    }

    create_token(username, password, client_id, client_secret) {
        var self = this;

        var payload = {
            grant_type: 'password',
            username: username,
            password: password,
            client_id: client_id,
            client_secret: client_secret
        };

        var options = {
            uri: 'http://'+this.host+':'+this.port+'/api/users/token',
            method: 'POST',
            json: payload
        };

        return new Promise(function(resolve, reject) {
            request_lib(options, function(err, res, body) {
                if (err) {
                    reject(Error(err));
                } else {
                    if (body.access_token) {
                        console.log("New token:", body.access_token);
                        resolve(body.access_token);
                    } else {
                        reject(Error(JSON.stringify(body)));
                    }
                }
            });
        });
    }

    request(protocol, path, access_token, payload) {
        var options = {
            uri: 'http://'+this.host+':'+this.port+'/api/'+path, // TODO: make https
            method: protocol,
            headers: {
                'Authorization': 'Bearer '+access_token
            },
            json: payload
        };

        console.log(options);
        return new Promise(function(resolve, reject) {
            request_lib(options, function(err, res, body) {
                if (err) {
                    console.log("err");
                    console.log(err);
                    reject(Error(err));
                } else {
                    console.log("no err");
                    if (body.error) reject(body.error);
                    else {
                        console.log(body);
                        if (!body.result) resolve(0);
                        else resolve(body.result);
                    }
                }
            });
        });
    }

    query_one(collection, access_token, filter) {
        return this.request('GET', collection+'/one', access_token, {
            filter: filter
        });
    }

    update_one(collection, access_token, filter, update) {
        return this.request('PUT', collection+'/one', access_token, {
            filter: filter,
            update: update
        });
    }

    commit_one(collection, access_token, obj) {
        return this.request('POST', collection, access_token, obj);
    }

}
