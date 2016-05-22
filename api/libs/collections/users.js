var Collection = require(process.cwd()+'/libs/collections/collection');

module.exports = new Collection({
    name: "users",
    schema: {
        username: {type: String, unique: true, required: true},
        hashed_password: {type: String, required: true},
        email: {type: String, unique: true, required: true},
        salt: {type: String, required: true},
        created: {type: Date, default: Date.now},
        activated: {type: Boolean, default: false},
    },
    indexes: []
});
