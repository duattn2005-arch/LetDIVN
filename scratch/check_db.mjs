import Database from 'better-sqlite3';

function inspect(dbPath) {
  console.log('--- Inspecting', dbPath, '---');
  try {
    const db = new Database(dbPath);
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables:', tables.map(t => t.name));
    for (const t of tables) {
      if (t.name === 'sqlite_sequence') continue;
      const count = db.prepare(`SELECT count(*) as c FROM ${t.name}`).get();
      console.log(`Table ${t.name}: ${count.c} rows`);
      if (t.name === 'content') {
        const rows = db.prepare(`SELECT * FROM content`).all();
        console.log('Content rows:', rows);
      }
    }
  } catch (e) {
    console.error(e.message);
  }
}

inspect('LetDIVN-main/server/data/app.db');
