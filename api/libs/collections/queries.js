var Collection = require(process.cwd()+'/libs/collections/collection');

module.exports = new Collection({
    name: "queries",
    schema: {
        owner: {type: String, required: true},
        timestamp: {type: Date, default: Date.now, required: true},
        filters: {type: Object, unique: true, required: true},
        fields: {type: Object, unique: true, required: true},
        settings: {type: Object, required: true},
    },
    indexes: []
});
