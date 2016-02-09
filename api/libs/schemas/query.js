// Query
var Query = {
    owner: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, required: true },
    filters: { type: Object, required: true },
    fields: { type: Object, required: true },
    settings: { type: Object, required: true }
};

module.exports = Query;
