require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./src/config/db');
const createApp = require('./src/app');
const initSockets = require('./src/sockets');

const PORT = process.env.PORT || 5000;

async function start() {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Create HTTP server + Socket.io (needs the raw http server, not just Express)
  const httpServer = http.createServer();

  const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length ? allowedOrigins : '*',
      credentials: true,
    },
  });

  // 3. Build Express app (gets access to `io` via req.io in every route)
  const app = createApp(io);
  httpServer.on('request', app);

  // 4. Wire up socket events + start the live telemetry simulation
  initSockets(io);

  httpServer.listen(PORT, () => {
    console.log(`🚀 EV Battery Intelligence API running on http://localhost:${PORT}`);
    console.log(`📘 Swagger docs available at http://localhost:${PORT}/api-docs`);
    console.log(`🔌 Socket.io live on the same port`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

// Handle unexpected crashes gracefully
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
