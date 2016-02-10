var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema,
    User = new Schema({
        username: { type: String, unique: true, required: true },
        hashedPassword: { type: String, required: true },
        email: { type: String, default: "auto@whiplash.ethz.com" },
        salt: { type: String, required: true },
        created: { type: Date, default: Date.now },
        projects: { type: Array, default: [] },
        activated: { type: Boolean, default: false }
    });

User.methods.generateHash = function() {
    return crypto.createHmac('sha1', this.salt).update(this.username).digest('hex');
};

User.methods.encryptPassword = function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    //more secure - return crypto.pbkdf2Sync(password, this.salt, 10000, 512).toString('hex');
};

User.virtual('userId').get(function () {
    return this.id;
});

User.virtual('password').set(function(password) {
    this._plainPassword = password;
    this.salt = crypto.randomBytes(32).toString('hex');
    //more secure - this.salt = crypto.randomBytes(128).toString('hex');
    this.hashedPassword = this.encryptPassword(password);
}).get(function() { return this._plainPassword; });


User.methods.checkPassword = function(password) {
    return this.encryptPassword(password) === this.hashedPassword;
};

User.methods.checkHash = function(hash) {
    return hash === this.generateHash();
};

module.exports = mongoose.model('User', User);
