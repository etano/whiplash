// WorkBatch
var WorkBatch = {
    owner: {type: String, required: true},
    timestamp: {type: Date, default: Date.now, required: true}
};

module.exports = WorkBatch;
