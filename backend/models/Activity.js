const { Schema, model } = require('mongoose');

const ActivitySchema = new Schema({
    entityType: { type: String, default: '' },
    entityId:   { type: Schema.Types.Mixed },
    title:      { type: String, required: true, trim: true },
    type:       { type: String, default: '' },
    date:       { type: Date },
    notes:      { type: String, default: '' },
    status:     { type: String, default: '' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Activity', ActivitySchema);
