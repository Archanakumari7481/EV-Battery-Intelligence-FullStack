const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, uppercase: true, trim: true }, // e.g. EV-003
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ['critical', 'warning', 'info'],
      required: true,
    },
    type: {
      type: String,
      enum: ['thermal', 'voltage', 'charging', 'nominal'],
      default: 'nominal',
    },
    acknowledged: { type: Boolean, default: false },
    technicianNotified: { type: Boolean, default: false },
  },
  { timestamps: true } // createdAt acts as the alert timestamp
);

alertSchema.index({ createdAt: -1 });
alertSchema.index({ severity: 1 });

module.exports = mongoose.model('Alert', alertSchema);
