var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Collaboration
var Collaboration = new Schema({
    owner: { type: String, required: true },
    name: { type: String, required: true },
    created: { type: Date, default: Date.now, required : true },
    users: { type: Array, required: true },
});

module.exports = mongoose.model('Collaboration', Collaboration);
