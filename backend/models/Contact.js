const { Schema, model } = require('mongoose');

const ContactSchema = new Schema({
    // ── Name ─────────────────────────────────────────────────────────────────
    salutation:  { type: String, trim: true, default: '' },   // Mr. / Mrs. / Dr. etc.
    firstName:   { type: String, required: true, trim: true },
    middleName:  { type: String, trim: true, default: '' },
    lastName:    { type: String, trim: true, default: '' },

    // ── Contact details ───────────────────────────────────────────────────────
    email:       { type: String, required: true, trim: true, lowercase: true },
    phone:       { type: String, trim: true, default: '' },
    workPhone:   { type: String, trim: true, default: '' },
    mobile:      { type: String, trim: true, default: '' },
    fax:         { type: String, trim: true, default: '' },

    // ── Organisation ─────────────────────────────────────────────────────────
    company:     { type: String, trim: true, default: '' },
    department:  { type: String, trim: true, default: '' },
    designation: { type: String, trim: true, default: '' },   // Job title / role
    companyId:   { type: Schema.Types.ObjectId, ref: 'Company', default: null },

    // ── Address ───────────────────────────────────────────────────────────────
    address1:    { type: String, trim: true, default: '' },   // Street address
    address2:    { type: String, trim: true, default: '' },   // Apt / suite / unit
    city:        { type: String, trim: true, default: '' },
    state:       { type: String, trim: true, default: '' },   // County / state
    post:        { type: String, trim: true, default: '' },   // Post / ZIP code
    country:     { type: String, trim: true, default: '' },

    // ── Online ────────────────────────────────────────────────────────────────
    website:     { type: String, trim: true, default: '' },
    facebook:    { type: String, default: '' },
    twitter:     { type: String, default: '' },
    linkedin:    { type: String, default: '' },
    gmail:       { type: String, default: '' },

    // ── CRM Status fields ─────────────────────────────────────────────────────
    idStatus:    { type: String, trim: true, default: '' },   // ID / Status identifier
    referredBy:  { type: String, trim: true, default: '' },   // Who referred them
    amaScore:    { type: String, trim: true, default: '' },   // AMA score / rating
    contactSource: {
        type: String,
        enum: ['Direct', 'Organic Search', 'Referral', ''],
        default: '',
    },

    // ── Meta / flags ─────────────────────────────────────────────────────────
    biography:   { type: String, default: '' },
    photo:       { type: String, default: '' },   // base64 or URL
    labels:      { type: String, default: '' },   // comma-separated tags
    tags:        { type: String, default: '' },
    favorite:    { type: Boolean, default: false },
    archived:    { type: Boolean, default: false },
    pending:     { type: Boolean, default: false },
    deleted:     { type: Boolean, default: false },
}, {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
});

module.exports = model('Contact', ContactSchema);
