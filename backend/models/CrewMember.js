const { Schema, model } = require('mongoose');

const CrewMemberSchema = new Schema({
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, trim: true, lowercase: true },
    phone:     { type: String, default: '' },
    userRole:  { type: String, enum: ['Default user role','Poweruser','Office','Admin'], default: 'Default user role' },
    folder:    { type: String, enum: ['1. Own Crew','2. Freelancers','3. External'], default: '1. Own Crew' },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

module.exports = model('CrewMember', CrewMemberSchema);
