var User = {
    username: {type: String, unique: true, required: true},
    hashed_password: {type: String, required: true},
    email: {type: String, unique: true, required: true},
    salt: {type: String, required: true},
    created: {type: Date, default: Date.now},
    activated: {type: Boolean, default: false},
};

module.exports = User;
