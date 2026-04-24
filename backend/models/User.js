const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
    name:     { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true, lowercase: true },
    email:    { type: String, required: true, trim: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['admin', 'manager', 'user'], default: 'user' },
    photo:    { type: String, default: '' },
}, {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
});

/* ── Hash password before insert / update ───────────────────────────────── */
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

/* ── Compare a plaintext candidate against the stored hash ─────────────── */
UserSchema.methods.comparePassword = function (candidate) {
    return bcrypt.compare(candidate, this.password);
};

/* ── Strip password from JSON output ────────────────────────────────────── */
UserSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = model('User', UserSchema);
