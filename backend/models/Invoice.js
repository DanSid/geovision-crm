const { Schema, model } = require('mongoose');

const InvoiceSchema = new Schema({
    invoiceNumber: { type: String, default: '' },
    clientName:    { type: String, default: '' },
    clientEmail:   { type: String, default: '' },
    items:         [{ description: String, quantity: Number, rate: Number, amount: Number }],
    subtotal:      { type: Number, default: 0 },
    tax:           { type: Number, default: 0 },
    total:         { type: Number, default: 0 },
    currency:      { type: String, enum: ['USD', 'GHS'], default: 'USD' },
    status:        { type: String, enum: ['Draft','Sent','Paid','Overdue'], default: 'Draft' },
    dueDate:       { type: Date },
    notes:         { type: String, default: '' },
    data:          { type: Schema.Types.Mixed }, // full invoice blob from frontend
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Invoice', InvoiceSchema);
