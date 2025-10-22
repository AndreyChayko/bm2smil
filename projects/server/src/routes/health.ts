import { Router, type Request, type Response } from 'express';
import { commonResponseHeaders } from '../middleware/security.js';

/**
 * Router providing health-check endpoints.
 */
export const healthRouter = Router();

healthRouter.use(commonResponseHeaders);

/**
 * GET /api/health
 *
 * Simple liveness probe that returns a plain-text message.
 */
healthRouter.get('/api/health', (_req: Request, res: Response) => {
  res.type('text/plain').status(200).send('server is up an running');
});

export default healthRouter;
