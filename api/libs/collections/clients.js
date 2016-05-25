var Collection = require(process.cwd()+'/libs/collections/collection');

module.exports = new Collection({
    name: "clients",
    schema: {
        owner: {type: String, required: true},
        name: {type: String, unique: true, required: true},
        client_id: {type: String, unique: true, required: true},
        client_secret: {type: String, required: true}
    },
    indexes: []
});
