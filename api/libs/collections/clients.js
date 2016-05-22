var Collection = require(process.cwd()+'/libs/collections/collection');

module.exports = new Collection({
    name: "clients",
    schema: {
        owner: {type: String, required: true},
        name: {type: String, unique: true, required: true},
        clientId: {type: String, unique: true, required: true},
        clientSecret: {type: String, required: true}
    },
    indexes: []
});
