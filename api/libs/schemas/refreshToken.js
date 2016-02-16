var RefreshToken = {
    userId: {type: String, required: true},
    clientId: {type: String, required: true},
    token: {type: String, unique: true, required: true},
    created: {type: Date, default: Date.now}
};

module.exports = RefreshToken;
