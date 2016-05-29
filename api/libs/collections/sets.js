var Collection = require(process.cwd()+'/libs/collections/collection');

module.exports = new Collection({
    name: "sets",
    schema: {
        owner: {type: String, required: true},
        name: {type: String, required: true, unique: true},
        description: {type: String, required: true},
        ids: {type: Array, required: true},
        timestamp: {type: Date, default: Date.now, required: true}
    },
    indexes: []
});
