var Collection = require(process.cwd()+'/libs/collections/collection');

module.exports = new Collection({
    name: "refreshtokens",
    schema: {
        owner: {type: String, required: true},
        clientId: {type: String, required: true},
        token: {type: String, unique: true, required: true},
        created: {type: Date, default: Date.now}
    },
    indexes: []
});
