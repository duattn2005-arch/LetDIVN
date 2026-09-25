import { Router } from 'express';
import { requireAdmin } from '../auth.js';
import { getNews, getPartners, getGallery, getTeam, getVideos, getWhatWeDo, getWhoWeAre, getMediaCoverage } from '../cmsContent.js';
import { events, volunteers, contacts } from '../db/collections.js';
import type { CleanupEvent, VolunteerRegistration } from '../../src/types.js';

const router = Router();

// --- Events ---
router.get('/events', (req, res) => {
  const all = events.getAll();
  // registeredCount used to be re-derived client-side on every read; now it's
  // a real column kept in sync by the volunteer endpoints below, but we still
  // guard against it ever drifting below the true live count.
  const withCounts = all.map((e) => {
    const liveCount = volunteers.getAll().filter((v) => v.eventId === e.id).length;
    return liveCount > e.registeredCount ? { ...e, registeredCount: liveCount } : e;
  });
  res.json(withCounts);
});
router.post('/events', requireAdmin, (req, res) => {
  res.json(events.insert(req.body));
});
router.put('/events/:id', requireAdmin, (req, res) => {
  const updated = events.update(String(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Không tìm thấy sự kiện' });
  res.json(updated);
});
router.delete('/events/:id', requireAdmin, (req, res) => {
  events.delete(String(req.params.id));
  res.json({ ok: true });
});

// --- Volunteers (insert/delete keep events.registeredCount in sync) ---
router.get('/volunteers', (req, res) => res.json(volunteers.getAll()));
router.post('/volunteers', (req, res) => {
  const body = req.body as Omit<VolunteerRegistration, 'id' | 'registeredAt'>;
  const created = volunteers.insert({ ...body, registeredAt: new Date().toISOString() } as any);
  const event = events.getAll().find((e: CleanupEvent) => e.id === created.eventId || e.title === created.eventName);
  if (event) events.update(event.id, { registeredCount: (event.registeredCount || 0) + 1 });
  res.json(created);
});
router.put('/volunteers/:id', requireAdmin, (req, res) => {
  const updated = volunteers.update(String(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Không tìm thấy đăng ký' });
  res.json(updated);
});
router.delete('/volunteers/:id', requireAdmin, (req, res) => {
  const existing = volunteers.getById(String(req.params.id));
  volunteers.delete(String(req.params.id));
  if (existing) {
    const event = events.getAll().find((e: CleanupEvent) => e.id === existing.eventId);
    if (event) events.update(event.id, { registeredCount: Math.max(0, (event.registeredCount || 0) - 1) });
  }
  res.json({ ok: true });
});

// --- Content managed in Decap CMS (/admin) ---
// News, partners, gallery, team, videos, What We Do, Who We Are sections and
// Media on Us entries are JSON files in the repo (see server/cmsContent.ts).
// They are read-only here: all editing happens in Decap.
router.get('/news', async (req, res) => res.json(await getNews()));
router.get('/partners', async (req, res) => res.json(await getPartners()));
router.get('/gallery', async (req, res) => res.json(await getGallery()));
router.get('/team', async (req, res) => res.json(await getTeam()));
router.get('/videos', async (req, res) => res.json(await getVideos()));
router.get('/what-we-do', async (req, res) => res.json(await getWhatWeDo()));
router.get('/who-we-are-sections', async (req, res) => res.json(await getWhoWeAre()));
router.get('/media-coverage', async (req, res) => res.json(await getMediaCoverage()));

// --- Contacts ---
router.get('/contacts', requireAdmin, (req, res) => res.json(contacts.getAll()));
router.post('/contacts', (req, res) => {
  res.json(contacts.insert({ ...req.body, status: 'Unread' }));
});
router.put('/contacts/:id', requireAdmin, (req, res) => {
  const updated = contacts.update(String(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Không tìm thấy tin nhắn' });
  res.json(updated);
});
router.delete('/contacts/:id', requireAdmin, (req, res) => {
  contacts.delete(String(req.params.id));
  res.json({ ok: true });
});

export default router;
