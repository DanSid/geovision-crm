const { Schema, model } = require('mongoose');

const MaintenanceSchema = new Schema({
    type:          { type: String, enum: ['repair','inspection','lostEquipment','inventoryCount'], default: 'repair' },
    title:         { type: String, required: true, trim: true },
    equipmentId:   { type: String, default: '' },
    equipmentName: { type: String, default: '' },
    assignedTo:    { type: String, default: '' },
    date:          { type: Date },
    status:        { type: String, enum: ['Pending','In Progress','Completed'], default: 'Pending' },
    priority:      { type: String, enum: ['Low','Medium','High','Urgent'], default: 'Medium' },
    notes:         { type: String, default: '' },
    cost:          { type: Number, default: 0 },
    currency:      { type: String, enum: ['GHS','USD'], default: 'GHS' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Maintenance', MaintenanceSchema);
