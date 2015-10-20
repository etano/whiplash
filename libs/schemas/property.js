var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Property
var Property = new Schema({
    owner: { type: String, required: true },
    model_id: { type: Number, required: true},
    executable_id: { type: Number, required: true},
    status: { type: Number, required: true, default: 0},
    result: { type: Schema.Types.Mixed, default: "" },
    params: { type: Schema.Types.Mixed, default: "" },
    timestamp: { type: Date, default: Date.now },
    timeout: { type: Number, required: true, default: 120 },
    _id: { type: Number }
});

module.exports = mongoose.model('Property', Property);
