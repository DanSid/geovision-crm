const { Schema, model } = require('mongoose');

const HistorySchema = new Schema({
    entityType:  { type: String, default: '' },
    entityId:    { type: Schema.Types.Mixed },
    action:      { type: String, required: true },
    description: { type: String, default: '' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('History', HistorySchema);
