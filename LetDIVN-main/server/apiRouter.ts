import express, { Router } from 'express';
import cookieParser from 'cookie-parser';

// Server-only env vars (DECAP_*, Google credentials, etc. — never VITE_-prefixed, so they
// never ship in the client bundle) live in the same .env file the frontend
// already uses. Node loads it natively; harmless if the file is absent
// (e.g. a host that sets real OS env vars instead).
try {
  process.loadEnvFile();
} catch {
  // no .env file present — fine, env vars may come from the OS/host instead
}

import collectionRoutes from './routes/collections.js';
import contentRoutes from './routes/content.js';
import statsRoutes from './routes/stats.js';
import geocodeRoutes from './routes/geocode.js';
import decapAuthRoutes from './routes/decapAuth.js';
import wpAdminRoutes from './routes/wpAdmin.js';

// Single router mounted at /api in both the Vite dev server plugin and the
// production server.ts, mirroring how googleSheetsMiddleware is dual-mounted
// — one implementation, never drifts between dev and prod.
export const apiRouter = Router();
apiRouter.use(cookieParser());
apiRouter.use(express.json({ limit: '2mb' }));
apiRouter.use(collectionRoutes);
apiRouter.use(contentRoutes);
apiRouter.use(statsRoutes);
apiRouter.use(geocodeRoutes);
apiRouter.use(decapAuthRoutes);
apiRouter.use(wpAdminRoutes);
