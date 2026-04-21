const { Schema, model } = require('mongoose');

const OpportunitySchema = new Schema({
    name:              { type: String, required: true, trim: true },
    company:           { type: String, trim: true, default: '' },
    contactName:       { type: String, trim: true, default: '' },
    dealValue:         { type: Number, default: 0 },
    dealCurrency:      { type: String, enum: ['USD', 'GHS'], default: 'USD' },
    stage:             { type: String, enum: ['Prospecting','Qualification','Proposal','Negotiation','Closed Won','Closed Lost','Invoice Issued'], default: 'Prospecting' },
    invoiceId:         { type: String, default: '' },
    startDate:         { type: Date },
    expectedCloseDate: { type: Date },
    notes:             { type: String, default: '' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Opportunity', OpportunitySchema);
