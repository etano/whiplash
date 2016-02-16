var crypto = require('crypto');

function hash_password(password) {
    var salt = crypto.randomBytes(32).toString('hex');
    //more secure - this.salt = crypto.randomBytes(128).toString('hex');
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
}

function generate_hash(salt, username) {
    return crypto.createHmac('sha1', salt).update(username).digest('hex');
}

function check_password(salt, password, hashed_password) {
    return encrypt_password(salt, password) === hashed_password;
}

function check_hash(hash, salt, username) {
    return hash === generate_hash(salt, username);
}

function generate_salt() {
    return crypto.randomBytes(32).toString('hex');
}

function encrypt_password(salt, password) {
    return crypto.createHmac('sha1', salt).update(password).digest('hex');
}

module.exports = {
    hash_password: function(password) { return hash_password(password); },
    generate_hash: function(salt, username) { return generate_hash(salt, username); },
    check_password: function(salt, password, hashed_password) { return check_password(salt, password, hashed_password); },
    check_hash: function(hash, salt, username) { return check_hash(hash, salt, username); },
    generate_salt: function() { return generate_salt(); },
    encrypt_password: function(salt, password) { return encrypt_password(salt, password); }
};
