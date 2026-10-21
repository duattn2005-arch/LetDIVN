// Static build of the read-only API for hosts without the Node server (Vercel):
// `npm run build` runs it after `vite build`. Every GET route the app reads is
// written to dist/api/<route>.json from content/ (the same code as
// server/cmsContent.ts); vercel.json serves /api/<route> from those files.
// Counts that live in SQLite on the Node server (sign-ups) start from zero.
process.env.CMS_SOURCE = 'local';

import fs from 'fs';
import path from 'path';

const cms = await import('../server/cmsContent.js');
const out = path.resolve(import.meta.dirname, '..', 'dist', 'api');
fs.mkdirSync(out, { recursive: true });

const [events, news, partners] = await Promise.all([cms.getEvents(), cms.getNews(), cms.getPartners()]);
const trashKg = events.reduce((sum, e) => sum + (e.trashCollectedKg || 0), 0) || 5200;

const routes: Record<string, unknown> = {
  content: await cms.getPageContent(),
  events,
  news,
  partners,
  team: await cms.getTeam(),
  videos: await cms.getVideos(),
  'what-we-do': await cms.getWhatWeDo(),
  'who-we-are-sections': await cms.getWhoWeAre(),
  'media-coverage': await cms.getMediaCoverage(),
  'project-pages': await cms.getProjectPages(),
  // As server/routes/stats.ts, with no sign-ups.
  stats: {
    totalTrashKg: trashKg,
    totalTrashTons: Math.round((trashKg / 1000) * 10) / 10,
    totalVolunteers: 5400,
    totalEvents: events.length + 100,
    totalProvinces: 63,
    totalPartners: partners.length > 0 ? partners.length : 24,
    totalNews: news.length,
    upcomingEventsCount: events.filter((e) => e.status === 'Upcoming').length,
  },
};

for (const [route, data] of Object.entries(routes)) {
  fs.writeFileSync(path.join(out, `${route}.json`), JSON.stringify(data));
  console.log(`api/${route}.json: ${Array.isArray(data) ? `${data.length} mục` : 'xong'}`);
}
