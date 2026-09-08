import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { googleSheetsMiddleware } from './server/googleSheetsMiddleware';
import { apiRouter } from './server/apiRouter';
import { uploadsDir } from './server/routes/upload';
import express from 'express';

function googleSheetsApiPlugin(): Plugin {
  return {
    name: 'google-sheets-api-plugin',
    configureServer(server) {
      server.middlewares.use(googleSheetsMiddleware);
    },
  };
}

function backendApiPlugin(): Plugin {
  return {
    name: 'backend-api-plugin',
    configureServer(server) {
      // Vite's dev middleware stack is bare Connect — a standalone Express
      // Router mounted directly onto it never gets res.json/res.status (those
      // come from a full express() app's response-prototype augmentation).
      // Wrapping the router in its own tiny express() app fixes that, and
      // that app itself is a valid Connect-style handler.
      const apiApp = express();
      apiApp.use('/api', apiRouter);
      server.middlewares.use(apiApp);
      server.middlewares.use('/uploads', express.static(uploadsDir));
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), googleSheetsApiPlugin(), backendApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      host: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

