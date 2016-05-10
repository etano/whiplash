var Executable = {
    schema: {
        name: { type: String, unique: true, required: true },
        owner: { type: String, unique: true, required: true },
        path: { type: String, unique: true, required: true },
        params: { type: Object, required: true },
        timestamp: { type: Date, default: Date.now, required: true },
    },
    indexes: []
};

module.exports = Executable;
