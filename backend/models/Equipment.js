const { Schema, model } = require('mongoose');

const EquipmentSchema = new Schema({
    name:          { type: String, required: true, trim: true },
    category:      { type: String, default: '' },
    salePrice:     { type: Number, default: 0 },
    currency:      { type: String, enum: ['GHS','USD'], default: 'GHS' },
    quantity:      { type: Number, default: 1 },
    stockLocation: { type: String, default: '' },
    saleType:      { type: String, enum: ['Rental','Sale'], default: 'Rental' },
    itemType:      { type: String, enum: ['Physical','Virtual'], default: 'Physical' },
    status:        { type: String, enum: ['Active','Archived'], default: 'Active' },
    serialNumber:  { type: String, default: '' },
    description:   { type: String, default: '' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Equipment', EquipmentSchema);
