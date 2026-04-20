const { Schema, model } = require('mongoose');

const TaskSchema = new Schema({
    title:      { type: String, required: true, trim: true },
    description:{ type: String, default: '' },
    done:       { type: Boolean, default: false },
    priority:   { type: String, enum: ['Low','Medium','High','Urgent'], default: 'Medium' },
    dueDate:    { type: Date },
    assignedTo: { type: String, default: '' },
    tags:       [{ type: String }],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Task', TaskSchema);
