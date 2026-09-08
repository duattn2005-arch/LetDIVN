import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function resetDb(dbPath) {
  if (!fs.existsSync(dbPath)) {
    console.log('DB not found at', dbPath);
    return;
  }
  console.log('Resetting DB at', dbPath);
  const db = new DatabaseSync(dbPath);
  
  // Clear site_content table so any old Vietnamese overrides are removed
  try {
    db.exec('DELETE FROM site_content;');
    console.log('Cleared site_content');
  } catch (e) {
    console.log('site_content error:', e.message);
  }

  // Clear events, news, partners, team, what_we_do, videos so seedIfEmpty repopulates with English
  const collections = ['events', 'news', 'partners', 'gallery', 'team', 'videos', 'what_we_do'];
  for (const c of collections) {
    try {
      db.exec(`DELETE FROM ${c};`);
      console.log(`Cleared ${c}`);
    } catch (e) {
      console.log(`${c} error:`, e.message);
    }
  }
}

resetDb('c:/Users/admin/Downloads/Let1/LetDIVN-main/server/data/app.db');
resetDb('c:/Users/admin/Downloads/Let1/code/server/data/app.db');
console.log('Database reset complete.');
