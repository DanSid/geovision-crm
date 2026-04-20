const { Schema, model } = require('mongoose');

const StockLocationSchema = new Schema({
    name:        { type: String, required: true, trim: true },
    color:       { type: String, default: '#4f46e5' },
    type:        { type: String, enum: ['Warehouse','Store','Workshop'], default: 'Warehouse' },
    active:      { type: String, enum: ['Yes','No'], default: 'Yes' },
    street:      { type: String, default: '' },
    houseNumber: { type: String, default: '' },
    postalCode:  { type: String, default: '' },
    city:        { type: String, default: '' },
    country:     { type: String, default: 'Ghana' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('StockLocation', StockLocationSchema);
