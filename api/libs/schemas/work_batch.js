var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Work_batch
var Work_batch = new Schema({
    owner: { type: String, required: true},
    timestamp: { type: Date, default: Date.now, required : true}
});

module.exports = mongoose.model('Work_batch', Work_batch);
