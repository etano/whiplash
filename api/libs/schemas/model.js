var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Model
var Model = new Schema({
    class: { type: String, required: true },
    owner: { type: String, required: true},
    content: { type: Schema.Types.Mixed, required: true },
    description: { type: String, default: "" },
    //checksum: {type: md5, required: true}, //TODO: if mongo does not do this already
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Model', Model);
