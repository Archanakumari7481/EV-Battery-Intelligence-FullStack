const express = require('express');
const router = express.Router();
const { exportCSV, exportPDF } = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Fleet diagnostic report export (CSV / PDF)
 */

/**
 * @swagger
 * /reports/csv:
 *   get:
 *     summary: Download fleet diagnostic data as CSV
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: CSV file
 *         content:
 *           text/csv:
 *             schema: { type: string, format: binary }
 */
router.get('/csv', exportCSV);

/**
 * @swagger
 * /reports/pdf:
 *   get:
 *     summary: Download fleet diagnostic data as PDF
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: PDF file
 *         content:
 *           application/pdf:
 *             schema: { type: string, format: binary }
 */
router.get('/pdf', exportPDF);

module.exports = router;
