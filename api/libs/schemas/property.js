var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Property
var Property = new Schema({
    owner: { type: String, required: true},
    input_model_id: { type: String, required: true},
    output_model_id: { type: String, default: "" },
    log: { type: String, default: "" },
    executable_id: { type: String, required: true},
    status: { type: Number, default: 0, required: true},
    timeout: { type: Number, required: true },
    params: { type: Schema.Types.Mixed, default: "", required: true},
    timestamp: { type: Date, default: Date.now, required : true},
    walltime: { type: Number, default: -1, required : true},
    resolve_by: { type: Number, default: -1, required : true},
    reserved: { type: Number, default: 0}
});

module.exports = mongoose.model('Property', Property);
