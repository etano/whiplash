var Collection = require(process.cwd()+'/libs/collections/collection');

module.exports = new Collection({
    name: "work_batches",
    schema: {
        owner: {type: String, required: true},
        timestamp: {type: Date, default: Date.now, required: true}
    },
    indexes: [
        {
            "fieldOrSpec": {timestamp: 1},
            "options": {}
        },
        {
            "fieldOrSpec": {owner: 1, total_time : 1},
            "options": {}
        }
    ]
});
