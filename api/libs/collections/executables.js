var Collection = require(process.cwd()+'/libs/collections/collection');

module.exports = new Collection({
    name: "executables",
    schema: {
        name: {type: String, unique: true, required: true},
        owner: {type: String, unique: true, required: true},
        path: {type: String, required: true},
        description: {type: String, required: true},
        params: {type: Object, required: true, default: {}},
        timestamp: {type: Date, default: Date.now, required: true},
    },
    indexes: []
});
