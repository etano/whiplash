var Query = {
    owner: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, required: true },
    filters: { type: Object, unique: true, required: true },
    fields: { type: Object, unique: true, required: true },
    settings: { type: Object, required: true },
};

module.exports = Query;
