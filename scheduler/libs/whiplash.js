var request_lib = require('request');

class whiplash {
    constructor(host, port, access_token) {
        this.host = host;
        this.port = port;
        this.access_token = access_token;
    }

    create_token(username, password) {
        var self = this;

        var payload = {
            grant_type: 'password',
            username: username,
            password: password,
            client_id: username+'-scheduler',
            client_secret: password
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
                    if (body.access_token)
                        self.access_token = body.access_token;
                    resolve(body.access_token);
                }
            });
        });
    }

    request(protocol, path, payload) {
        var options = {
            uri: 'http://'+this.host+':'+this.port+'/api/'+path,
            method: protocol,
            headers: {
                'Authorization': 'Bearer '+this.access_token
            },
            json: payload
        };

        return new Promise(function(resolve, reject) {
            request_lib(options, function(err, res, body) {
                if (err) {
                    reject(Error(err));
                } else {
                    resolve(body.result);
                }
            });
        });
    }
}

module.exports = whiplash;
