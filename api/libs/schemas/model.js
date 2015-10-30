var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Model
var Model = new Schema({
    owner: { type: String, required: true},
    content: { type: Schema.Types.Mixed, default: "", required: true },
    tags: { type: Schema.Types.Mixed, default: "", required: true },
    property_id: { type: String, default: "" },
    checksum: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, required: true }
});

module.exports = mongoose.model('Model', Model);
