const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./config/swagger');
const { notFound, errorHandler } = require('./middleware/error');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const alertRoutes = require('./routes/alertRoutes');
const chargeRoutes = require('./routes/chargeRoutes');
const rangeRoutes = require('./routes/rangeRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const reportRoutes = require('./routes/reportRoutes');

function createApp(io) {
  const app = express();

  // Socket.io/Engine.io registers its own request listener on the same raw
  // HTTP server to handle /socket.io/* requests. Express is a SEPARATE
  // listener on that same server, so it also receives those requests. Without
  // this guard, Express would try to send its own 404 response after
  // Engine.io already responded, crashing with ERR_HTTP_HEADERS_SENT. This
  // middleware stops Express from touching anything under /socket.io and lets
  // Engine.io's own listener handle it exclusively.
  app.use((req, res, next) => {
    if (req.url.startsWith('/socket.io')) {
      return;
    }
    next();
  });

  // ---- Security & core middleware ----
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins.length ? allowedOrigins : '*',
      credentials: true,
    })
  );

  // Basic rate limiting to protect the API from abuse
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
      message: { success: false, message: 'Too many requests, please try again later.' },
    })
  );

  // Make io available inside every controller via req.io
  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  // ---- Health check ----
  app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'EV Battery Intelligence API is running', time: new Date() });
  });

  // ---- Swagger docs ----
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

  // ---- API routes ----
  app.use('/api/auth', authRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/alerts', alertRoutes);
  app.use('/api/charge-sessions', chargeRoutes);
  app.use('/api/range-predictions', rangeRoutes);
  app.use('/api/maintenance', maintenanceRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/reports', reportRoutes);

  // ---- Error handling (must be last) ----
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;