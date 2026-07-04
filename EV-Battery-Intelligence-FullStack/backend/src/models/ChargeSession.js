const mongoose = require('mongoose');

const chargeSessionSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, uppercase: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    start: { type: Number, required: true, min: 0, max: 100 }, // SOC % at start
    end: { type: Number, required: true, min: 0, max: 100 }, // SOC % at end
    duration: { type: Number, required: true }, // minutes
    energy: { type: Number, required: true }, // kWh delivered
    type: { type: String, enum: ['DC Fast', 'AC Slow'], required: true },
  },
  { timestamps: true }
);

chargeSessionSchema.index({ vehicleId: 1, date: -1 });

module.exports = mongoose.model('ChargeSession', chargeSessionSchema);
