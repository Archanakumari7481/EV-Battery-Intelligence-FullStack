// Converts backend documents into the exact object shape the frontend pages
// were originally built against (see src/data/mockData.js), so that
// Dashboard.jsx, BatteryHealth.jsx, FleetMap.jsx, etc. never need to change.

export function timeAgo(dateInput) {
  if (!dateInput) return 'just now';
  const diffMs = Date.now() - new Date(dateInput).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function formatClockTime(dateInput) {
  return new Date(dateInput).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function mapVehicle(v) {
  return {
    id: v.vehicleId,
    healthScore: v.healthScore,
    status: v.status,
    estimatedRange: v.estimatedRange,
    lastCharged: timeAgo(v.lastCharged),
    soc: v.soc,
    temp: v.temp,
    voltage: v.voltage,
    cycles: v.cycles,
  };
}

export function mapAlert(a) {
  return {
    id: a._id,
    vehicle: a.vehicleId,
    message: a.message,
    severity: a.severity,
    timestamp: formatClockTime(a.createdAt || Date.now()),
    type: a.type,
  };
}

export function mapRecommendation(r) {
  return {
    id: r._id,
    vehicle: r.vehicleId,
    component: r.component,
    icon: r.icon,
    issue: r.issue,
    urgency: r.urgency,
    urgencyText: r.urgencyText,
    action: r.action,
    cost: r.cost,
    confidence: r.confidence,
  };
}

export function mapSettings(s) {
  return {
    thermalTriggerTemp: s.thermalTriggerTemp,
    criticalSohThreshold: s.criticalSohThreshold,
    alertRefreshInterval: s.alertRefreshInterval,
    emailAlerts: s.emailAlerts,
    soundAlerts: s.soundAlerts,
    autoIsolate: s.autoIsolate,
  };
}
