var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Model
var Model = new Schema({
    class: { type: String, required: true },
    owner: { type: String, required: true},
    content: { type: Schema.Types.Mixed, required: true },
    checksum: {type: String, required: true},
    description: { type: String, default: "" },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Model', Model);
