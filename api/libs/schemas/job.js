var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Job
var Job = new Schema({
    owner: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, required : true },
    ids: { type: Array, require: true }
});

module.exports = mongoose.model('Job', Job);
