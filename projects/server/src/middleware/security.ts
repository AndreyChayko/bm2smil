import type { Express, RequestHandler } from 'express';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MAX_BODY_SIZE_BYTES } from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Apply base security and body parsing middlewares.
 * - Helmet sets common security headers.
 * - CORS is enabled (no credentials) to ease local dev; adjust origins in production.
 * - JSON and URL-encoded parsers enforce size limits.
 * - Serves static built UI if present (../../dist relative to this file).
 */
export function applySecurity(app: Express): void {
  app.disable('x-powered-by');
  app.use(helmet());

  app.use(
    cors({
      origin: true, // reflect request origin in dev; consider restricting in prod
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Accept'],
      credentials: false,
      maxAge: 600,
    }),
  );

  const bodyLimit = `${MAX_BODY_SIZE_BYTES}`; // express accepts string or number
  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

  // serve built UI if exists. Try repo root /dist first, then local /dist as fallback.
  const staticRootDist = resolve(__dirname, '..', '..', '..', '..', 'dist');
  const staticLocalDist = resolve(__dirname, '..', '..', 'dist');
  app.use(express.static(staticRootDist));
  app.use(express.static(staticLocalDist));
}

/**
 * Extra headers to add on certain responses.
 */
export const commonResponseHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  next();
};
