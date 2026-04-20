const { Schema, model } = require('mongoose');

const ContactSchema = new Schema({
    firstName:   { type: String, required: true, trim: true },
    middleName:  { type: String, trim: true, default: '' },
    lastName:    { type: String, trim: true, default: '' },
    email:       { type: String, required: true, trim: true, lowercase: true },
    phone:       { type: String, trim: true, default: '' },
    workPhone:   { type: String, trim: true, default: '' },
    department:  { type: String, trim: true, default: '' },
    company:     { type: String, trim: true, default: '' },
    designation: { type: String, trim: true, default: '' },
    website:     { type: String, trim: true, default: '' },
    city:        { type: String, trim: true, default: '' },
    state:       { type: String, trim: true, default: '' },
    country:     { type: String, trim: true, default: '' },
    biography:   { type: String, default: '' },
    photo:       { type: String, default: '' },   // base64 or URL
    labels:      { type: String, default: '' },   // comma-separated tags
    tags:        { type: String, default: '' },
    facebook:    { type: String, default: '' },
    twitter:     { type: String, default: '' },
    linkedin:    { type: String, default: '' },
    gmail:       { type: String, default: '' },
    contactSource: { type: String, enum: ['Direct', 'Organic Search', 'Referral', ''], default: '' },
    favorite:    { type: Boolean, default: false },
    archived:    { type: Boolean, default: false },
    pending:     { type: Boolean, default: false },
    deleted:     { type: Boolean, default: false },
    companyId:   { type: Schema.Types.ObjectId, ref: 'Company', default: null },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Contact', ContactSchema);
