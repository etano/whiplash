var Executable = {
    name: { type: String, required: true },
    owner: { type: String, required: true },
    path: { type: String, required: true },
    params: { type: Object, required: true },
    timestamp: { type: Date, default: Date.now, required: true }
};

module.exports = Executable;
