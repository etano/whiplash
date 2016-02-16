var Client = {
    name: {type: String, unique: true, required: true},
    clientId: {type: String, unique: true, required: true},
    clientSecret: {type: String, required: true},
    userId: {type: String, required: false}
};

module.exports = Client;
