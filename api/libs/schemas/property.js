var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Property
var Property = new Schema({
    owner: { type: String, required: true },
    model_id: { type: Schema.Types.ObjectId, required: true},
    executable_id: { type: Schema.Types.ObjectId, required: true},
    status: { type: Number, default: 0, required: true},
    timeout: { type: Number, default: 120, required: true },
    result: { type: Schema.Types.Mixed, default: "" },
    params: { type: Schema.Types.Mixed, default: "" },
    timestamp: { type: Date, default: Date.now },
    walltime: { type: Number, default: -1},
    resolve_by: { type: Number, default: -1 }
});

module.exports = mongoose.model('Property', Property);
