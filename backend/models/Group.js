const { Schema, model } = require('mongoose');

const GroupSchema = new Schema({
    name:       { type: String, required: true, trim: true },
    contactIds: [{ type: Schema.Types.Mixed }], // stores string or ObjectId IDs
    color:      { type: String, default: '#4f46e5' },
    notes:      { type: String, default: '' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Group', GroupSchema);
