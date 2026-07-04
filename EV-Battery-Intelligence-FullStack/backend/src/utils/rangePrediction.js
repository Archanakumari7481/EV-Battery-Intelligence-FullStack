/**
 * Predicts remaining range (km) from battery %, pack temperature and health score,
 * and classifies the result the same way the frontend RangePredictor page does
 * (Optimal / Thermal Advisory / Critical Degradation).
 *
 * @param {number} batteryPercent - current State of Charge (0-100)
 * @param {number} temperature - pack temperature in °C
 * @param {number} healthScore - State of Health (0-100)
 * @param {number} baseRangeKm - full-charge range of this vehicle model, default 400km
 */
function predictRange(batteryPercent, temperature, healthScore, baseRangeKm = 400) {
  const predictedRange = Math.round(baseRangeKm * (batteryPercent / 100) * (healthScore / 100));

  let status = 'Optimal';
  let severity = 'success';

  if (temperature >= 49) {
    status = 'Critical Degradation';
    severity = 'error';
  } else if (temperature >= 40) {
    status = 'Thermal Advisory';
    severity = 'warning';
  } else if (healthScore < 40) {
    status = 'Critical Degradation';
    severity = 'error';
  } else if (healthScore < 65) {
    status = 'Thermal Advisory';
    severity = 'warning';
  }

  return { predictedRange, status, severity };
}

module.exports = predictRange;
