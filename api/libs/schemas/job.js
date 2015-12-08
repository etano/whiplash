var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Job
var Job = new Schema({
    owner: { type: String, required: true },
    name: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, required : true },
    ids: { type: Array, required: true },
    submitted: { type: Number, required: true, default: 0 },
    script: { type: String, required: false, default: "" }
});

module.exports = mongoose.model('Job', Job);
