import { Router } from 'express';
import { requireAdmin } from '../auth.js';
import { db } from '../db/index.js';

const router = Router();

// Whole site_content table comes back as one {key: value} object — the app
// has 10-20+ EditableText/EditableImage slots per page, so fetching them
// individually would mean that many HTTP round-trips; one blob mirrors how
// this worked as a single localStorage read and is much cheaper.
router.get('/content', (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_content').all() as { key: string; value: string }[];
  const all: Record<string, string> = {};
  rows.forEach((r) => { all[r.key] = r.value; });
  res.json(all);
});

router.put('/content/:key', requireAdmin, (req, res) => {
  const { value } = req.body || {};
  db.prepare(
    'INSERT INTO site_content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(req.params.key, String(value ?? ''));
  res.json({ ok: true });
});

router.delete('/content/:key', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM site_content WHERE key = ?').run(req.params.key);
  res.json({ ok: true });
});

export default router;
