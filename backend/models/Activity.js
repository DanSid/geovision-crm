const { Schema, model } = require('mongoose');

const ActivitySchema = new Schema({
    entityType:    { type: String, default: '' },
    entityId:      { type: Schema.Types.Mixed },

    // Core activity fields
    title:         { type: String, required: true, trim: true },
    type:          { type: String, trim: true, default: '' }, // Meeting | Call | Email | To-Do

    // Date/time — stored as strings to preserve format and avoid UTC conversion
    date:          { type: String, default: '' }, // ISO datetime "2026-04-24T14:30" OR "YYYY-MM-DD"
    time:          { type: String, default: '' }, // "HH:MM" — used when date is date-only

    // Scheduling metadata
    duration:      { type: String, trim: true, default: '' }, // "30 Minutes", "1 Hour", etc.
    priority:      { type: String, trim: true, default: '' }, // Low | Medium | High | Urgent

    // Content
    description:   { type: String, default: '' }, // Notes / agenda / summary
    notes:         { type: String, default: '' },  // Legacy alias — keep for backward compat

    // Status
    completed:     { type: Boolean, default: false },
    status:        { type: String, default: '' },  // Legacy — keep for backward compat

    // Relations
    opportunityId: { type: String, default: '' },
    contactName:   { type: String, default: '' },  // Denormalised for quick display
}, {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
});

module.exports = model('Activity', ActivitySchema);
