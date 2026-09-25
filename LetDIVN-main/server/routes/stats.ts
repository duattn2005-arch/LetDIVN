import { Router } from 'express';
import { events, volunteers } from '../db/collections.js';
import { getNews, getPartners } from '../cmsContent.js';

const router = Router();

router.get('/stats', async (req, res) => {
  const allEvents = events.getAll();
  const allVolunteers = volunteers.getAll();
  const allPartners = await getPartners();
  const allNews = await getNews();

  const trashKg = allEvents.reduce((sum, e) => sum + (e.trashCollectedKg || 0), 0);

  const partnerCount = allPartners.length > 0 ? allPartners.length : 24;

  res.json({
    totalTrashKg: trashKg || 5200,
    totalTrashTons: Math.round(((trashKg || 5200) / 1000) * 10) / 10,
    totalVolunteers: allVolunteers.length + 5400,
    totalEvents: allEvents.length + 100,
    totalProvinces: 63,
    totalPartners: partnerCount,
    totalNews: allNews.length,
    pendingVolunteersCount: allVolunteers.filter((v) => v.status === 'Pending').length,
    upcomingEventsCount: allEvents.filter((e) => e.status === 'Upcoming').length,
  });
});

export default router;
