var express = require('express');
var http = require('http');
var router = express.Router();

function serialize(obj, prefix) {
    var str = [];
    for(var p in obj) {
        if (obj.hasOwnProperty(p)) {
            var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
            str.push(typeof v == "object" ?
                serialize(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
        }
    }
    return str.join("&");
}

router.get('/:user', function(req, res, next) {
    var payload = {
        filter: {'username': req.params.user},
        fields: ['username', '_id']
    };
    var qs = serialize(payload);

    var options = {
        hostname: process.env.WHIPLASH_API_HOST,
        port: process.env.WHIPLASH_API_PORT,
        path: '/api/users?'+qs,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer '+req.query.access_token
        }
    };

    var request = http.request(options, (result) => {
        result.setEncoding('utf8');
        result.on('data', (chunk) => {
            chunk = JSON.parse(chunk);
            if (chunk.error) {
                res.redirect('/login');
            } else if (chunk.result) {
                if (chunk.result.length > 0) {
                    var user = chunk.result[0].username;
                    if (req.params.user === user) {
                        if (user === "admin") {
                            res.render('admin', {});
                        } else {
                            res.render('user', {
                                user: chunk.result[0]
                            });
                        }
                    } else {
                        res.redirect('/login');
                    }
                } else {
                    res.redirect('/login');
                }
            } else {
                res.redirect('/login');
            }
        });
    }).on('error', function(e) {
        console.log(e);
        res.redirect('login');
    }).end();

});

module.exports = router;
