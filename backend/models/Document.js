const { Schema, model } = require('mongoose');

const DocumentSchema = new Schema({
    entityType: { type: String, default: '' },
    entityId:   { type: Schema.Types.Mixed },
    name:       { type: String, required: true, trim: true },
    type:       { type: String, default: '' },
    size:       { type: Number, default: 0 },
    url:        { type: String, default: '' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Document', DocumentSchema);
