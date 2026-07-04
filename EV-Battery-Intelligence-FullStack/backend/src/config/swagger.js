const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EV Battery Intelligence Dashboard API',
      version: '1.0.0',
      description:
        'Production REST API for the EV Battery Intelligence Dashboard — fleet vehicle telemetry, battery health, alerts, charging history, range prediction, maintenance recommendations, and settings. Real-time updates are also pushed via Socket.io.',
      contact: { name: 'EV Battery Intelligence API' },
    },
    servers: [
      { url: 'http://localhost:5000/api', description: 'Local development server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'], // reads JSDoc @swagger comments from route files
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
