const { Schema, model } = require('mongoose');

const VehicleSchema = new Schema({
    registrationNumber: { type: String, required: true, trim: true },
    name:               { type: String, required: true, trim: true },
    costPerKm:          { type: Number, default: 0 },
    fixedRate:          { type: Number, default: 0 },
    currency:           { type: String, enum: ['GHS','USD'], default: 'GHS' },
    inspectionDate:     { type: Date },
    seats:              { type: Number, default: 0 },
    loadCapacity:       { type: Number, default: 0 },
    surfaceArea:        { type: String, default: '' },
    width:              { type: Number, default: 0 },
    length:             { type: Number, default: 0 },
    height:             { type: Number, default: 0 },
    folder:             { type: String, default: 'Vehicles' },
    availability:       { type: String, enum: ['Once at a time','Multiple bookings'], default: 'Once at a time' },
    displayInPlanner:   { type: String, enum: ['Yes','No'], default: 'Yes' },
    description:        { type: String, default: '' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Vehicle', VehicleSchema);
