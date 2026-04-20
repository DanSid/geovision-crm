const { Schema, model } = require('mongoose');

const RequestSchema = new Schema({
    customerId:       { type: Schema.Types.Mixed },
    customerName:     { type: String, default: '' },
    opportunityId:    { type: Schema.Types.Mixed },
    opportunityName:  { type: String, default: '' },
    equipmentNeeded:  [{ type: String }],
    vehicleIds:       [{ type: Schema.Types.Mixed }],
    vehicleNames:     [{ type: String }],
    crewMemberIds:    [{ type: Schema.Types.Mixed }],
    crewMemberNames:  [{ type: String }],
    startDate:        { type: Date },
    endDate:          { type: Date },
    notes:            { type: String, default: '' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('Request', RequestSchema);
