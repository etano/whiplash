var User = {
    username: { type: String, unique: true, required: true },
    hashedPassword: { type: String, required: true },
    email: { type: String, default: "auto@whiplash.ethz.com" },
    salt: { type: String, required: true },
    created: { type: Date, default: Date.now },
    activated: { type: Boolean, default: false },
};

module.exports = User;
