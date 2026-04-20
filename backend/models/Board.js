const { Schema, model } = require('mongoose');

// Boards store Kanban column/card structure — kept flexible with Mixed
const BoardSchema = new Schema({
    name:    { type: String, required: true, trim: true },
    color:   { type: String, default: '#4f46e5' },
    columns: { type: Schema.Types.Mixed, default: [] }, // Kanban columns array
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Board', BoardSchema);
