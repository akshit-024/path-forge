import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';

import { getConfig, type AppConfig } from './config/env.js';
import { createErrorHandler, notFoundHandler } from './middleware/error-handler.js';
import { createApiRouter } from './routes/index.js';
import { createServices } from './services/index.js';
import type { AppServices } from './types/services.js';

interface CreateAppOptions {
  config?: AppConfig;
  services?: AppServices;
}

export function createApp(options: CreateAppOptions = {}): Express {
  const config = options.config ?? getConfig();
  const services = options.services ?? createServices(config);
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || origin === config.clientOrigin) {
          callback(null, true);
          return;
        }
        // CORS is a browser boundary, not authentication. Omitting the header safely
        // blocks unapproved cross-origin reads without rejecting same-origin production requests.
        callback(null, false);
      },
    }),
  );
  app.use(express.json({ limit: '32kb' }));

  app.use('/api', createApiRouter(services));

  if (config.nodeEnv === 'production') {
    const clientDist = fileURLToPath(new URL('../../client/dist/', import.meta.url));
    const indexFile = path.join(clientDist, 'index.html');
    if (existsSync(indexFile)) {
      app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
      app.get('*', (_request, response) => {
        response.sendFile(indexFile);
      });
    }
  }

  app.use(notFoundHandler);
  app.use(createErrorHandler(config));
  return app;
}
