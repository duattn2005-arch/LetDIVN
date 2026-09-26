import { Router } from 'express';
import { db } from '../db/index.js';
import { getPageContent } from '../cmsContent.js';

const router = Router();

// Image crop positions set with the old on-page editor, kept as they were
// (they are not editable any more). Its colour / alignment / size overrides
// are dropped: the pages take their look from the code, matching the
// reference site letsdoitvietnam.org.
const LEGACY_STYLE_KEY = /__position$/;

// All page text and images as one {key: value} object — a page has 10-20+
// EditableText/EditableImage slots, so one request beats one per slot. Text
// and images come from Decap (content/page-content/, see server/cmsContent.ts).
router.get('/content', async (req, res) => {
  const rows = db.prepare('SELECT key, value FROM site_content').all() as { key: string; value: string }[];
  const all: Record<string, string> = {};
  rows.forEach((r) => {
    if (LEGACY_STYLE_KEY.test(r.key)) all[r.key] = r.value;
  });
  Object.assign(all, await getPageContent());
  res.json(all);
});

export default router;
