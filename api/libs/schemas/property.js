var Property = {
    owner: {type: String, required: true},
    input_model_id: {type: String, required: true},
    output_model_id: {type: String, required: false},
    log: {type: String, required: false},
    executable_id: {type: String, required: true},
    status: {type: String, default: "unresolved", required: true},
    timeout: {type: Number, default: 60, required: true},
    params: {type: Object, default: {}, required: true},
    timestamp: {type: Date, default: Date.now, required: true}
};

module.exports = Property;
