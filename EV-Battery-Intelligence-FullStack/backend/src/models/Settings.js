const mongoose = require('mongoose');

// Settings are kept per-user so each fleet manager can have their own thresholds.
const settingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    thermalTriggerTemp: { type: Number, default: 49.0, min: 20, max: 80 },
    criticalSohThreshold: { type: Number, default: 35.0, min: 10, max: 90 },
    alertRefreshInterval: { type: Number, default: 8, min: 2, max: 60 }, // seconds
    emailAlerts: { type: Boolean, default: true },
    soundAlerts: { type: Boolean, default: false },
    autoIsolate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
