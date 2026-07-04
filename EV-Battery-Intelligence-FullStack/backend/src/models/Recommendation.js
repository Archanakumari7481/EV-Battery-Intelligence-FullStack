const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    vehicleId: { type: String, required: true, uppercase: true, trim: true },
    component: { type: String, required: true }, // e.g. "Battery Pack"
    icon: { type: String, default: 'Wrench' }, // lucide-react icon name for frontend
    issue: { type: String, required: true },
    urgency: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      required: true,
    },
    urgencyText: { type: String, required: true }, // e.g. "Act within 3 days"
    action: { type: String, required: true },
    cost: { type: Number, required: true }, // estimated cost in INR
    confidence: { type: Number, min: 0, max: 100, required: true }, // AI confidence %
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
