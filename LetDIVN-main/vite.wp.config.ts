import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

// Build of the site for the WordPress theme (wordpress/letsdoitvietnam/):
// `npm run build:wp`. Same code as the Node site; the theme serves it from
// its dist/ folder and the plugin ldivn-core answers /api/*.

const THEME = 'letsdoitvietnam';
const BASE = `/wp-content/themes/${THEME}/dist/`;
const publicDir = path.resolve(__dirname, 'public');

/**
 * The code points at files in public/ with absolute paths ("/images/...",
 * "/logo.png"), which in WordPress live in the theme folder. This rewrites
 * those paths to the theme's dist/ and copies just the files used there.
 * A string is only rewritten when it is exactly a file in public/, or a
 * template literal starting with a folder of public/ (`/partners/${...}`) —
 * API paths like '/partners' are left alone.
 */
function publicAssetPaths(): Plugin {
  const files = new Set<string>();
  const isFile = (p: string) => fs.existsSync(path.join(publicDir, p)) && fs.statSync(path.join(publicDir, p)).isFile();
  const isDir = (p: string) => fs.existsSync(path.join(publicDir, p)) && fs.statSync(path.join(publicDir, p)).isDirectory();
  const walk = (dir: string): string[] =>
    fs.readdirSync(path.join(publicDir, dir), { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? walk(path.posix.join(dir, e.name)) : [path.posix.join(dir, e.name)]
    );

  return {
    name: 'ldivn-public-asset-paths',
    enforce: 'pre',
    transform(code, id) {
      const file = id.replace(/\\/g, '/');
      if (!/\/src\/.*\.[jt]sx?$/.test(file) || file.includes('/src/admin/')) return null;
      const out = code.replace(/(["'`])\/([A-Za-z0-9._\-/]+?)(?=\1|\$\{)/g, (match, quote: string, p: string, offset: number) => {
        const templatePrefix = code.startsWith('${', offset + match.length);
        if (templatePrefix ? p.endsWith('/') && isDir(p) : isFile(p)) {
          if (templatePrefix) walk(p.replace(/\/$/, '')).forEach((f) => files.add(f));
          else files.add(p);
          return `${quote}${BASE}${p}`;
        }
        return match;
      });
      return out === code ? null : { code: out, map: null };
    },
    generateBundle() {
      for (const f of files) {
        this.emitFile({ type: 'asset', fileName: f, source: fs.readFileSync(path.join(publicDir, f)) });
      }
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [publicAssetPaths(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  publicDir: false,
  build: {
    outDir: path.resolve(__dirname, 'wordpress', THEME, 'dist'),
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/main.tsx'),
    },
  },
});
