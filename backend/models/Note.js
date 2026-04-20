const { Schema, model } = require('mongoose');

const NoteSchema = new Schema({
    entityType: { type: String, default: '' },
    entityId:   { type: Schema.Types.Mixed },
    content:    { type: String, required: true },
    color:      { type: String, default: '' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Note', NoteSchema);
