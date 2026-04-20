const { Schema, model } = require('mongoose');

const CompanySchema = new Schema({
    name:    { type: String, required: true, trim: true },
    email:   { type: String, trim: true, default: '' },
    phone:   { type: String, trim: true, default: '' },
    website: { type: String, trim: true, default: '' },
    address: { type: String, default: '' },
    industry:{ type: String, default: '' },
    notes:   { type: String, default: '' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Company', CompanySchema);
