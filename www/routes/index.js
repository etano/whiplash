var express = require('express');
var http = require('http');
var router = express.Router();

router.get('/', function(req, res, next) {
    var options = {
        hostname: process.env.WHIPLASH_API_HOST,
        port: process.env.WHIPLASH_API_PORT,
        path: '/api/users/fresh',
        method: 'GET'
    };

    http.request(options, (result) => {
        result.setEncoding('utf8');
        result.on('data', (chunk) => {
            chunk = JSON.parse(chunk);
            if (chunk.error) {
                res.render('index', {
                    fresh: false,
                    authorized: false,
                    message: ""
                });
            } else if (chunk.result) {
                res.render('index', {
                    fresh: true,
                    authorized: false,
                    message: ""
                });
            } else {
                res.render('index', {
                    fresh: false,
                    authorized: false,
                    message: ""
                });
            }
        });
    }).on('error', function(e) {
        res.render('index', {
            fresh: false,
            authorized: false,
            message: "Cannot find Whiplash API server!"
        });
    }).end();
});

module.exports = router;
