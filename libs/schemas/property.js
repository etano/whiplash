var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Property
var Property = new Schema({
    class: { type: String, required: true },
    owner: { type: String, required: true },
    model_id: { type: Schema.Types.ObjectId, required: true},
    executable_id: { type: Schema.Types.ObjectId, required: true},
    status: { type: Number, required: true},
    seed: { type: Number, required: true},
    cfg: { type: Schema.Types.Mixed, default: "" },
    params: { type: Schema.Types.Mixed, default: "" },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Property', Property);
