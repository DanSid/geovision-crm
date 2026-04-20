const { Schema, model } = require('mongoose');

// Single-document settings: pipeline state + permissions
const SettingSchema = new Schema({
    key:   { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Setting', SettingSchema);
