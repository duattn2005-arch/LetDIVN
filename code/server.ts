import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { googleSheetsMiddleware } from './server/googleSheetsMiddleware';
import { apiRouter } from './server/apiRouter';
import { uploadsDir } from './server/routes/upload';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Google Sheets API routes (same handlers used by `npm run dev`).
app.use((req, res, next) => googleSheetsMiddleware(req, res, next));

// Real backend API (auth, events, news, partners, ...) — same router used by
// the Vite dev server plugin, so dev and prod never drift.
app.use('/api', apiRouter);

// Admin-uploaded images (real files on disk, not base64-in-DB).
app.use('/uploads', express.static(uploadsDir));

// Serve the built static site (run `npm run build` first).
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir));

// SPA fallback: any other GET request serves index.html.
// (Plain app.use instead of a '*' path pattern — Express 5's path-to-regexp
// requires a named wildcard like '/*splat' for bare '*' routes.)
app.use((req, res) => {
  if (req.method !== 'GET') {
    res.sendStatus(404);
    return;
  }
  res.sendFile(path.join(distDir, 'index.html'));
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server đang chạy tại http://0.0.0.0:${port}`);
});


