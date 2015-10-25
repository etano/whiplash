var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Executable
var Executable = new Schema({
    class: { type: String, required: true },
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, required: true },
    description: { type: String, required: true},
    algorithm: { type: String, required: true},
    version: { type: String, required: true},
    build: { type: String, required: true},
    path: { type: String, required: true},
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Executable', Executable);
