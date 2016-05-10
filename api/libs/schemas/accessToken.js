var AccessToken = {
    schema: {
        owner: {type: String, required: true},
        clientId: {type: String, required: true},
        token: {type: String, unique: true, required: true},
        created: {type: Date, default: Date.now}
    },
    indexes: []
};

module.exports  = AccessToken;
