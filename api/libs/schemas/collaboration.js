var Collaboration = {
    owner: { type: String, required: true },
    name: { type: String, required: true },
    created: { type: Date, default: Date.now, required : true },
    users: { type: Array, required: true },
    hashed_fields: ['name']
};

module.exports = Collaboration;
