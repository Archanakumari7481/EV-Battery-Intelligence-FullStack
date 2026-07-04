const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const Vehicle = require('../models/Vehicle');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Export current fleet diagnostic data as CSV
// @route   GET /api/reports/csv
// @access  Private
const exportCSV = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find().lean();

  const fields = [
    'vehicleId',
    'healthScore',
    'status',
    'estimatedRange',
    'soc',
    'temp',
    'voltage',
    'cycles',
    'lastCharged',
  ];
  const parser = new Parser({ fields });
  const csv = parser.parse(vehicles);

  res.header('Content-Type', 'text/csv');
  res.attachment(`fleet-report-${Date.now()}.csv`);
  res.send(csv);
});

// @desc    Export current fleet diagnostic data as PDF
// @route   GET /api/reports/pdf
// @access  Private
const exportPDF = asyncHandler(async (req, res) => {
  const vehicles = await Vehicle.find().lean();

  const doc = new PDFDocument({ margin: 40 });
  res.header('Content-Type', 'application/pdf');
  res.attachment(`fleet-report-${Date.now()}.pdf`);
  doc.pipe(res);

  doc.fontSize(18).text('EV Fleet Diagnostic Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).fillColor('gray').text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(1.5);

  vehicles.forEach((v) => {
    doc
      .fillColor('black')
      .fontSize(13)
      .text(`${v.vehicleId}  —  Status: ${v.status.toUpperCase()}`);
    doc
      .fontSize(10)
      .fillColor('gray')
      .text(
        `SOH: ${v.healthScore}%   SOC: ${v.soc}%   Temp: ${v.temp}°C   Voltage: ${v.voltage}V   Cycles: ${v.cycles}   Range: ${v.estimatedRange}km`
      );
    doc.moveDown();
  });

  doc.end();
});

module.exports = { exportCSV, exportPDF };
