const { Schema, model } = require('mongoose');

const CustomerSchema = new Schema({
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    phone:   { type: String, trim: true, default: '' },
    company: { type: String, trim: true, default: '' },
    status:  { type: String, enum: ['Active','Inactive','Prospect','VIP'], default: 'Active' },
    address: { type: String, default: '' },
    notes:   { type: String, default: '' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Customer', CustomerSchema);
