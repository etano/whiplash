var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Executable
var Executable = new Schema({
    name: { type: String, required: true },
    owner: { type: String, required: true },
    description: { type: String, required: true },
    algorithm: { type: String, required: true },
    version: { type: String, required: true },
    build: { type: String, required: true },
    path: { type: String, required: true },
    params: { type: Object, required: true },
    timestamp: { type: Date, default: Date.now, required: true }
});

module.exports = mongoose.model('Executable', Executable);
