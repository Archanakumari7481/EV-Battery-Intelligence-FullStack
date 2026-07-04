const mongoose = require('mongoose');

// One row of monthly capacity degradation history (used in BatteryHealth trend chart)
const degradationPointSchema = new mongoose.Schema(
  {
    month: { type: String, required: true }, // e.g. "Jul 25"
    capacityPercent: { type: Number, required: true },
  },
  { _id: false }
);

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // e.g. EV-001
    },
    name: { type: String, trim: true }, // optional friendly name
    healthScore: { type: Number, min: 0, max: 100, default: 100 }, // SOH %
    status: {
      type: String,
      enum: ['healthy', 'warning', 'critical', 'ISOLATED'],
      default: 'healthy',
    },
    estimatedRange: { type: Number, default: 0 }, // km
    soc: { type: Number, min: 0, max: 100, default: 100 }, // State of Charge %
    temp: { type: Number, default: 25 }, // pack temperature °C
    voltage: { type: Number, default: 400 }, // V
    cycles: { type: Number, default: 0 }, // charge cycle count
    lastCharged: { type: Date, default: Date.now },
    location: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
      city: { type: String, default: '' },
    },
    degradationHistory: [degradationPointSchema],
    isolatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

vehicleSchema.index({ status: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
