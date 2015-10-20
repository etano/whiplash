var mongoose = require('mongoose');
// TODO: add inherited types
//var extend = require('mongoose-schema-extend');
var Schema = mongoose.Schema;

// Model
var Model = new Schema({
    class: { type: String, required: true },
    owner: { type: String, required: true },
    description: { type: String, default: "" },
    body: { type: Schema.Types.Mixed, required: true },
    timestamp: { type: Date, default: Date.now },
    _id: { type: Number }
});

module.exports = mongoose.model('Model', Model);
