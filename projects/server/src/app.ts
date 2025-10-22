import express, { type Express } from 'express';
import { applySecurity } from './middleware/security.js';
import healthRouter from './routes/health.js';
import convertRouter from './routes/convert.js';

/**
 * Build and configure the Express application instance.
 *
 * This function encapsulates middleware and route registration so it can be
 * imported by the server entry point and by tests.
 */
export function createApp(): Express {
  const app = express();

  // Security, CORS, parsers, static
  applySecurity(app);

  // Routes
  app.use(healthRouter);
  app.use(convertRouter);

  return app;
}

export default createApp;
