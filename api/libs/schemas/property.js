var Property = {
    schema: {
        owner: {type: String, unique: true, required: true},
        input_model_id: {type: String, unique: true, required: true},
        output_model_id: {type: String, required: false},
        log: {type: String, required: false},
        executable_id: {type: String, unique: true, required: true},
        status: {type: String, default: "unresolved", required: true},
        timeout: {type: Number, default: 60, required: true},
        params: {type: Object, default: {}, unique: true, required: true},
        timestamp: {type: Date, default: Date.now, required: true},
    },
    indexes: [
        {
            "fieldOrSpec": {owner: 1, input_model_id: 1, executable_id: 1},
            "options": {}
        },
        {
            "fieldOrSpec": {owner: 1, status: 1},
            "options": {}
        },
        {
            "fieldOrSpec": {owner: 1, commit_tag: 1},
            "options": {}
        }
    ]
};

module.exports = Property;
