const jwt = require('jsonwebtoken');
const startTelemetryEngine = require('./telemetryEngine');

function initSockets(io) {
  // Optional: verify JWT on socket handshake so only logged-in dashboards connect
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(); // allow anonymous read-only viewers too
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(); // invalid token still allowed to connect as viewer, but you can call next(new Error('unauthorized')) to block
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  // Kick off the live telemetry simulation that pushes updates to everyone
  startTelemetryEngine(io);
}

module.exports = initSockets;
