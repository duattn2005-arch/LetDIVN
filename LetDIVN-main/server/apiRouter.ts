import express, { Router } from 'express';
import cookieParser from 'cookie-parser';

// Server-only env vars (ADMIN_EMAILS, etc. — never VITE_-prefixed, so they
// never ship in the client bundle) live in the same .env file the frontend
// already uses. Node loads it natively; harmless if the file is absent
// (e.g. a host that sets real OS env vars instead).
try {
  process.loadEnvFile();
} catch {
  // no .env file present — fine, env vars may come from the OS/host instead
}

import { seedIfEmpty } from './db/seed.js';
import authRoutes from './routes/auth.js';
import collectionRoutes from './routes/collections.js';
import contentRoutes from './routes/content.js';
import usersRoutes from './routes/users.js';
import adminsRoutes from './routes/admins.js';
import statsRoutes from './routes/stats.js';
import uploadRoutes from './routes/upload.js';

seedIfEmpty();

// Single router mounted at /api in both the Vite dev server plugin and the
// production server.ts, mirroring how googleSheetsMiddleware is dual-mounted
// — one implementation, never drifts between dev and prod.
export const apiRouter = Router();
apiRouter.use(cookieParser());
apiRouter.use(express.json({ limit: '2mb' }));
// Google's redirect-mode "Sign In With Google" posts the ID token as a real
// HTML form (application/x-www-form-urlencoded), not JSON — see
// routes/auth.ts's /google-onetap.
apiRouter.use(express.urlencoded({ extended: false, limit: '2mb' }));
apiRouter.use('/auth', authRoutes);
apiRouter.use(collectionRoutes);
apiRouter.use(contentRoutes);
apiRouter.use(usersRoutes);
apiRouter.use(adminsRoutes);
apiRouter.use(statsRoutes);
apiRouter.use(uploadRoutes);
