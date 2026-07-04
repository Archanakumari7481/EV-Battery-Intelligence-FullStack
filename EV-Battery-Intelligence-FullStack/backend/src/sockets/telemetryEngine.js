const Vehicle = require('../models/Vehicle');
const Alert = require('../models/Alert');
const Settings = require('../models/Settings');

const alertTemplates = [
  { message: 'Thermal Runaway Risk: Cell Group exceeded 49°C', severity: 'critical', type: 'thermal' },
  { message: 'Critical cell voltage drop detected', severity: 'critical', type: 'voltage' },
  { message: 'Charging anomaly: high impedance detected', severity: 'warning', type: 'charging' },
  { message: 'Pack temperature stabilizing', severity: 'info', type: 'nominal' },
  { message: 'SOH drop detected — service recommended', severity: 'warning', type: 'charging' },
];

const randomBetween = (min, max) => Math.random() * (max - min) + min;

/**
 * Starts three background loops that continuously mutate vehicle telemetry
 * in MongoDB and push the changes to every connected dashboard via Socket.io.
 * This is the server-side equivalent of the setInterval() calls that used to
 * live inside the React frontend's App.jsx.
 */
function startTelemetryEngine(io) {
  if (process.env.SIMULATE_TELEMETRY !== 'true') {
    console.log('ℹ️  Telemetry simulation disabled (SIMULATE_TELEMETRY=false)');
    return;
  }

  const healthIntervalMs = parseInt(process.env.HEALTH_UPDATE_INTERVAL_MS) || 5000;
  const tempIntervalMs = parseInt(process.env.TEMP_UPDATE_INTERVAL_MS) || 6000;
  const alertIntervalMs = parseInt(process.env.ALERT_INTERVAL_MS) || 8000;

  // 1. Battery health (SOH) fluctuation
  setInterval(async () => {
    try {
      const vehicles = await Vehicle.find({ status: { $ne: 'ISOLATED' } });
      const settings = await Settings.findOne().sort({ updatedAt: -1 }); // most recently touched settings

      for (const vehicle of vehicles) {
        const change = Math.floor(Math.random() * 5) - 2; // -2..+2
        let newSoh = Math.max(0, Math.min(100, vehicle.healthScore + change));

        const criticalThreshold = settings ? settings.criticalSohThreshold : 35;
        let newStatus = 'healthy';
        if (newSoh < criticalThreshold) newStatus = 'critical';
        else if (newSoh < 65) newStatus = 'warning';

        vehicle.healthScore = newSoh;
        vehicle.status = newStatus;
        await vehicle.save();
        io.emit('vehicle:update', vehicle);
      }
    } catch (err) {
      console.error('Telemetry engine (health) error:', err.message);
    }
  }, healthIntervalMs);

  // 2. Pack temperature / SOC / range fluctuation
  setInterval(async () => {
    try {
      const vehicles = await Vehicle.find({ status: { $ne: 'ISOLATED' } });

      for (const vehicle of vehicles) {
        const tempChange = randomBetween(-0.8, 0.8);
        vehicle.temp = parseFloat((vehicle.temp + tempChange).toFixed(1));

        const socChange = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        vehicle.soc = Math.max(10, Math.min(100, vehicle.soc + socChange));

        const baseRange = 400; // could be per-vehicle-model in a real fleet
        vehicle.estimatedRange = Math.round(
          baseRange * (vehicle.soc / 100) * (vehicle.healthScore / 100)
        );

        await vehicle.save();
        io.emit('vehicle:update', vehicle);
      }
    } catch (err) {
      console.error('Telemetry engine (temp) error:', err.message);
    }
  }, tempIntervalMs);

  // 3. Random live alert injector
  setInterval(async () => {
    try {
      const vehicles = await Vehicle.find();
      if (!vehicles.length) return;

      const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
      const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)];

      const alert = await Alert.create({
        vehicleId: vehicle.vehicleId,
        message: template.message,
        severity: template.severity,
        type: template.type,
      });

      io.emit('alert:new', alert);
    } catch (err) {
      console.error('Telemetry engine (alerts) error:', err.message);
    }
  }, alertIntervalMs);

  console.log('🔴 Live telemetry simulation engine started (health/temp/alerts)');
}

module.exports = startTelemetryEngine;
