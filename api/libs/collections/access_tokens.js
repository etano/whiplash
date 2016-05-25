var Collection = require(process.cwd()+'/libs/collections/collection');

module.exports = new Collection({
    name: "accesstokens",
    schema: {
        owner: {type: String, required: true},
        client_id: {type: String, required: true},
        token: {type: String, unique: true, required: true},
        created: {type: Date, default: Date.now}
    },
    indexes: []
});
