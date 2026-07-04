require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Alert = require('../models/Alert');
const ChargeSession = require('../models/ChargeSession');
const Recommendation = require('../models/Recommendation');
const Settings = require('../models/Settings');

const vehicles = [
  {
    vehicleId: 'EV-001',
    healthScore: 82,
    status: 'healthy',
    estimatedRange: 345,
    soc: 88,
    temp: 34.2,
    voltage: 398,
    cycles: 184,
    location: { lat: 19.076, lng: 72.8777, city: 'Mumbai' },
    degradationHistory: [
      { month: 'Jul 25', capacityPercent: 99.2 },
      { month: 'Aug 25', capacityPercent: 97.8 },
      { month: 'Sep 25', capacityPercent: 96.0 },
      { month: 'Oct 25', capacityPercent: 94.5 },
      { month: 'Nov 25', capacityPercent: 93.1 },
      { month: 'Dec 25', capacityPercent: 91.4 },
      { month: 'Jan 26', capacityPercent: 89.8 },
      { month: 'Feb 26', capacityPercent: 88.1 },
      { month: 'Mar 26', capacityPercent: 86.5 },
      { month: 'Apr 26', capacityPercent: 84.9 },
      { month: 'May 26', capacityPercent: 83.2 },
      { month: 'Jun 26', capacityPercent: 82.0 },
    ],
  },
  {
    vehicleId: 'EV-002',
    healthScore: 61,
    status: 'warning',
    estimatedRange: 256,
    soc: 72,
    temp: 42.8,
    voltage: 391,
    cycles: 312,
    location: { lat: 28.6139, lng: 77.209, city: 'Delhi' },
    degradationHistory: [
      { month: 'Jul 25', capacityPercent: 98.5 },
      { month: 'Aug 25', capacityPercent: 96.1 },
      { month: 'Sep 25', capacityPercent: 93.8 },
      { month: 'Oct 25', capacityPercent: 90.2 },
      { month: 'Nov 25', capacityPercent: 87.5 },
      { month: 'Dec 25', capacityPercent: 84.9 },
      { month: 'Jan 26', capacityPercent: 81.3 },
      { month: 'Feb 26', capacityPercent: 77.8 },
      { month: 'Mar 26', capacityPercent: 73.2 },
      { month: 'Apr 26', capacityPercent: 69.0 },
      { month: 'May 26', capacityPercent: 64.8 },
      { month: 'Jun 26', capacityPercent: 61.0 },
    ],
  },
  {
    vehicleId: 'EV-003',
    healthScore: 38,
    status: 'critical',
    estimatedRange: 142,
    soc: 45,
    temp: 49.5,
    voltage: 368,
    cycles: 428,
    location: { lat: 12.9716, lng: 77.5946, city: 'Bangalore' },
    degradationHistory: [
      { month: 'Jul 25', capacityPercent: 97.8 },
      { month: 'Aug 25', capacityPercent: 95.2 },
      { month: 'Sep 25', capacityPercent: 91.5 },
      { month: 'Oct 25', capacityPercent: 88.0 },
      { month: 'Nov 25', capacityPercent: 82.4 },
      { month: 'Dec 25', capacityPercent: 79.1 },
      { month: 'Jan 26', capacityPercent: 73.5 },
      { month: 'Feb 26', capacityPercent: 66.8 },
      { month: 'Mar 26', capacityPercent: 58.4 },
      { month: 'Apr 26', capacityPercent: 51.2 },
      { month: 'May 26', capacityPercent: 44.9 },
      { month: 'Jun 26', capacityPercent: 38.0 },
    ],
  },
  {
    vehicleId: 'EV-004',
    healthScore: 91,
    status: 'healthy',
    estimatedRange: 378,
    soc: 95,
    temp: 31.2,
    voltage: 402,
    cycles: 64,
    location: { lat: 13.0827, lng: 80.2707, city: 'Chennai' },
    degradationHistory: [],
  },
];

const alerts = [
  { vehicleId: 'EV-003', message: 'Thermal Runaway Risk: Cell Group 4 exceeded 49°C', severity: 'critical', type: 'thermal' },
  { vehicleId: 'EV-003', message: 'Critical cell voltage drop: Cell #18 read 3.12V', severity: 'critical', type: 'voltage' },
  { vehicleId: 'EV-002', message: 'Charging anomaly: high contactor impedance detected', severity: 'warning', type: 'charging' },
  { vehicleId: 'EV-002', message: 'Thermal Advisory: Elevated pack cooling flow rate', severity: 'warning', type: 'thermal' },
  { vehicleId: 'EV-001', message: 'Regenerative braking torque restricted: battery temperature low', severity: 'warning', type: 'charging' },
  { vehicleId: 'EV-004', message: 'Charge cycle completed: 100% capacity balance achieved', severity: 'info', type: 'nominal' },
  { vehicleId: 'EV-001', message: 'State of Health (SoH) recalibrated to 82% after slow charge', severity: 'info', type: 'nominal' },
];

const chargeSessions = [
  { vehicleId: 'EV-001', date: '2026-06-28', start: 12, end: 88, duration: 42, energy: 54.7, type: 'DC Fast' },
  { vehicleId: 'EV-003', date: '2026-06-27', start: 22, end: 45, duration: 25, energy: 16.5, type: 'AC Slow' },
  { vehicleId: 'EV-002', date: '2026-06-27', start: 30, end: 72, duration: 38, energy: 30.2, type: 'DC Fast' },
  { vehicleId: 'EV-004', date: '2026-06-26', start: 15, end: 95, duration: 55, energy: 57.6, type: 'DC Fast' },
  { vehicleId: 'EV-001', date: '2026-06-25', start: 40, end: 90, duration: 28, energy: 36.0, type: 'AC Slow' },
  { vehicleId: 'EV-002', date: '2026-06-24', start: 45, end: 68, duration: 18, energy: 16.5, type: 'DC Fast' },
  { vehicleId: 'EV-003', date: '2026-06-23', start: 10, end: 38, duration: 20, energy: 20.1, type: 'AC Slow' },
  { vehicleId: 'EV-004', date: '2026-06-22', start: 20, end: 85, duration: 45, energy: 46.8, type: 'DC Fast' },
  { vehicleId: 'EV-001', date: '2026-06-21', start: 5, end: 80, duration: 48, energy: 54.0, type: 'DC Fast' },
  { vehicleId: 'EV-002', date: '2026-06-20', start: 25, end: 88, duration: 44, energy: 45.3, type: 'AC Slow' },
];

const recommendations = [
  { vehicleId: 'EV-003', component: 'Battery Pack', icon: 'Battery', issue: 'Cell group 4 degrading rapidly', urgency: 'Critical', urgencyText: 'Act within 3 days', action: 'Replace cell group 4 immediately', cost: 45000, confidence: 94 },
  { vehicleId: 'EV-002', component: 'Charging Contactor', icon: 'Zap', issue: 'High impedance detected', urgency: 'High', urgencyText: 'Act within 7 days', action: 'Inspect and replace contactor', cost: 12000, confidence: 88 },
  { vehicleId: 'EV-001', component: 'Cooling System', icon: 'Thermometer', issue: 'Pack temp trending upward', urgency: 'Medium', urgencyText: 'Act within 14 days', action: 'Service cooling pump', cost: 8500, confidence: 79 },
  { vehicleId: 'EV-004', component: 'Traction Motor', icon: 'Cpu', issue: 'Minor vibration anomaly', urgency: 'Low', urgencyText: 'Act within 30 days', action: 'Schedule motor inspection', cost: 5000, confidence: 68 },
];

async function seed() {
  await connectDB();

  if (process.argv.includes('--destroy')) {
    await Promise.all([
      User.deleteMany(),
      Vehicle.deleteMany(),
      Alert.deleteMany(),
      ChargeSession.deleteMany(),
      Recommendation.deleteMany(),
      Settings.deleteMany(),
    ]);
    console.log('🗑️  All collections cleared');
    return mongoose.connection.close();
  }

  await Promise.all([
    Vehicle.deleteMany(),
    Alert.deleteMany(),
    ChargeSession.deleteMany(),
    Recommendation.deleteMany(),
  ]);

  await Vehicle.insertMany(vehicles);
  await Alert.insertMany(alerts);
  await ChargeSession.insertMany(chargeSessions);
  await Recommendation.insertMany(recommendations);

  // Create a demo admin user if none exists yet
  let demoUser = await User.findOne({ email: 'admin@evfleet.com' });
  if (!demoUser) {
    demoUser = await User.create({
      name: 'Fleet Admin',
      email: 'admin@evfleet.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('👤 Demo user created -> email: admin@evfleet.com | password: admin123');
  }

  const existingSettings = await Settings.findOne({ user: demoUser._id });
  if (!existingSettings) {
    await Settings.create({ user: demoUser._id });
  }

  console.log('✅ Database seeded successfully with fleet demo data');
  mongoose.connection.close();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
