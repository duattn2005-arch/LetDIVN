import { Router } from 'express';
import { requireAdmin } from '../auth.js';
import { events, volunteers, news, partners, gallery, team, contacts, videos, whatWeDo } from '../db/collections.js';
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
router.get('/volunteers', requireAdmin, (req, res) => res.json(volunteers.getAll()));
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

// --- News ---
router.get('/news', (req, res) => res.json(news.getAll()));
router.post('/news', requireAdmin, (req, res) => {
  const body = { ...req.body, views: Math.floor(Math.random() * 50) + 10, status: req.body.status || 'Published' };
  res.json(news.insert(body));
});
router.put('/news/:id', requireAdmin, (req, res) => {
  const updated = news.update(String(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Không tìm thấy bài viết' });
  res.json(updated);
});
router.delete('/news/:id', requireAdmin, (req, res) => {
  news.delete(String(req.params.id));
  res.json({ ok: true });
});

// --- Partners (supports bulk reorder via PUT /partners) ---
router.get('/partners', (req, res) => res.json(partners.getAll()));
router.post('/partners', requireAdmin, (req, res) => {
  res.json(partners.insert(req.body, { sortOrder: -1 })); // new partners lead the list, like the old prepend behavior
});
router.put('/partners/reorder', requireAdmin, (req, res) => {
  partners.replaceAll(req.body.partners || []);
  res.json({ ok: true });
});
router.put('/partners/:id', requireAdmin, (req, res) => {
  const updated = partners.update(String(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Không tìm thấy đối tác' });
  res.json(updated);
});
router.delete('/partners/:id', requireAdmin, (req, res) => {
  partners.delete(String(req.params.id));
  res.json({ ok: true });
});

// --- Gallery ---
router.get('/gallery', (req, res) => res.json(gallery.getAll()));
router.post('/gallery', requireAdmin, (req, res) => {
  res.json(gallery.insert({ ...req.body, likes: 0 }));
});
router.put('/gallery/:id', requireAdmin, (req, res) => {
  const updated = gallery.update(String(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Không tìm thấy ảnh' });
  res.json(updated);
});
router.delete('/gallery/:id', requireAdmin, (req, res) => {
  gallery.delete(String(req.params.id));
  res.json({ ok: true });
});

// --- Team ---
router.get('/team', (req, res) => res.json(team.getAll()));
router.post('/team', requireAdmin, (req, res) => {
  res.json(team.insert(req.body));
});
router.put('/team/:id', requireAdmin, (req, res) => {
  const updated = team.update(String(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Không tìm thấy thành viên' });
  res.json(updated);
});
router.delete('/team/:id', requireAdmin, (req, res) => {
  team.delete(String(req.params.id));
  res.json({ ok: true });
});

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

// --- Videos ---
router.get('/videos', (req, res) => res.json(videos.getAll()));
router.post('/videos', (req, res) => {
  const { youtubeId, title, thumbnailUrl } = req.body || {};
  if (!youtubeId) {
    return res.status(400).json({ error: 'Thiếu mã video YouTube' });
  }
  const created = videos.insert({
    youtubeId,
    title: title || 'Video Let\'s do it! Vietnam',
    thumbnailUrl: thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    addedAt: new Date().toISOString()
  });
  res.json(created);
});
router.delete('/videos/:id', (req, res) => {
  videos.delete(String(req.params.id));
  res.json({ ok: true });
});

// --- What We Do ---
router.get('/what-we-do', (req, res) => res.json(whatWeDo.getAll()));
router.post('/what-we-do', requireAdmin, (req, res) => {
  const all = whatWeDo.getAll();
  res.json(whatWeDo.insert({ ...req.body, order: all.length + 1 }));
});
router.put('/what-we-do/:id', requireAdmin, (req, res) => {
  const updated = whatWeDo.update(String(req.params.id), req.body);
  if (!updated) return res.status(404).json({ error: 'Không tìm thấy mục' });
  res.json(updated);
});
router.delete('/what-we-do/:id', requireAdmin, (req, res) => {
  whatWeDo.delete(String(req.params.id));
  res.json({ ok: true });
});

export default router;
