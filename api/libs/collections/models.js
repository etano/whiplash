var Collection = require(process.cwd()+'/libs/collections/collection');

module.exports = new Collection({
    name: "models",
    schema: {
        owner: {type: String, required: true},
        timestamp: {type: Date, default: Date.now, required: true},
        format: {type: String, required: true, default: "json"}
    },
    indexes: []
});
