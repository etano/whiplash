var Client = {
    schema: {
        owner: {type: String, required: true},
        name: {type: String, unique: true, required: true},
        clientId: {type: String, unique: true, required: true},
        clientSecret: {type: String, required: true}
    },
    indexes: []
};

module.exports = Client;
