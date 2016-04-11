// Model
var Model = {
    schema: {
        owner: {type: String, required: true},
        timestamp: {type: Date, default: Date.now, required: true}
    },
    indexes: []
};

module.exports = Model;
