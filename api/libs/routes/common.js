var libs = process.cwd() + '/libs/';
var log = require(libs + 'log')(module);
var XXHash = require('xxhash').XXHash64;
require(libs + '/timer');

function checksum(str) {
    // original version:
    // crypto.createHash('md5').update(str, 'utf8').digest('hex');
    global.timer.get_timer('checksum').start();
    var hash = new XXHash(0xCAFEBABE); // note: same seed each time
    var buffer = new Buffer(str, 'utf8');
    hash.update(buffer);
    var res = hash.digest('hex');
    global.timer.get_timer('checksum').stop();
    return res;
}

function smart_stringify(obj) {
    if(typeof(obj) !== 'object') {
        return JSON.stringify(obj);
    }
    global.timer.get_timer('smart_stringify').start();
    var keys = Object.keys(obj).sort();
    var str = '{';
    for(var i = 0; i < keys.length; i++) {
        str += '"' + keys[i] + '":' + smart_stringify(obj[keys[i]]) + ',';
    }
    str += '}';
    global.timer.get_timer('smart_stringify').stop();
    return str;
}

function hash(obj) {
    global.timer.get_timer('hash').start();
    var res = checksum(smart_stringify(obj));
    global.timer.get_timer('hash').stop();
    return res;
}

module.exports = {

    omit: function(obj, omitKey) {
        return Object.keys(obj).reduce((result, key) => {
            if (key !== omitKey) {
                result[key] = obj[key];
            }
            return result;
        }, {});
    },

    hash: function(obj) {
        return hash(obj);
    },

    smart_stringify: function(obj) {
        return smart_stringify(obj);
    },

    get_payload: function(req, key) {
        global.timer.get_timer('get_payload').start();
        if (!req.query[key]) {
            if (!req.body[key]) {
                global.timer.get_timer('get_payload').stop();
                return req.body;
            } else {
                global.timer.get_timer('get_payload').stop();
                return req.body[key];
            }
        } else {
            global.timer.get_timer('get_payload').stop();
            return req.query[key];
        }
    },

    return: function(res, err, obj) {
        global.timer.get_timer('return').start();
        if (!err) {
            if (isNaN(obj)) {
                var x = obj.length;
                if (isNaN(x)) {
                    log.debug('returning object');
                } else {
                    log.debug('returning %d objects', obj.length);
                }
            } else {
                log.debug('returning '+JSON.stringify(obj));
            }
            global.timer.get_timer('return').stop();
            return res.send({status: 'OK', result: obj});
        } else {
            log.error(JSON.stringify(err));
            if (!res.hasOwnProperty('statusCode')) {
                res.statusCode = 500;
            }
            global.timer.get_timer('return').stop();
            return res.send({status: res.statusCode, error: JSON.stringify(err)});
        }
    },

};
