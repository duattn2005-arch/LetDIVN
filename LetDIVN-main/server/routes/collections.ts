import { Router } from 'express';
import { getNews, getPartners, getGallery, getTeam, getVideos, getWhatWeDo, getWhoWeAre, getMediaCoverage, getEvents, getProjectPages } from '../cmsContent.js';
import { events, volunteers, contacts } from '../db/collections.js';
import type { VolunteerRegistration } from '../../src/types.js';

const router = Router();

// --- Events ---
// The events themselves are edited in Decap (content/events/). Sign-up counts
// are live data, so they stay in SQLite: the old events table still holds the
// counter of events created before Decap, and every sign-up is a volunteers row.
router.get('/events', async (req, res) => {
  const storedCounts = new Map(events.getAll().map((e) => [e.id, e.registeredCount || 0]));
  const signups = volunteers.getAll();
  const list = (await getEvents()).map((e) => ({
    ...e,
    registeredCount: Math.max(storedCounts.get(e.id) ?? 0, signups.filter((v) => v.eventId === e.id).length),
  }));
  res.json(list);
});

// --- Volunteers ---
// Sign-ups are also written to Google Sheets (by the browser), which is where
// they are read; there is deliberately no endpoint that lists them.
router.post('/volunteers', (req, res) => {
  const body = req.body as Omit<VolunteerRegistration, 'id' | 'registeredAt'>;
  const created = volunteers.insert({ ...body, registeredAt: new Date().toISOString() } as any);
  const event = events.getAll().find((e) => e.id === created.eventId);
  if (event) events.update(event.id, { registeredCount: (event.registeredCount || 0) + 1 });
  res.json({ id: created.id });
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
router.get('/project-pages', async (req, res) => res.json(await getProjectPages()));

// --- Contacts ---
router.post('/contacts', (req, res) => {
  const created = contacts.insert({ ...req.body, status: 'Unread' });
  res.json({ id: created.id });
});

export default router;
