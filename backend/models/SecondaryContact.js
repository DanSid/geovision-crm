const { Schema, model } = require('mongoose');

const SecondaryContactSchema = new Schema({
    entityType: { type: String, default: 'contact' },
    entityId:   { type: Schema.Types.Mixed },
    firstName:  { type: String, required: true, trim: true },
    lastName:   { type: String, trim: true, default: '' },
    email:      { type: String, trim: true, default: '' },
    phone:      { type: String, trim: true, default: '' },
    role:       { type: String, trim: true, default: '' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('SecondaryContact', SecondaryContactSchema);
