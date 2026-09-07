import { Router } from 'express';

const router = Router();

// The Cleanup Map used to call nominatim.openstreetmap.org directly from
// the visitor's browser. That fails for anyone whose browser/network can't
// reach it directly — ad blockers commonly block it, and so do some ISPs —
// with no useful error surfaced (just a silently broken search/boundary).
// Proxying through here means visitors only ever talk to our own domain,
// and it doubles as a single shared place to respect Nominatim's ~1
// request/second usage-policy cap and set a real identifying User-Agent.
let queue: Promise<void> = Promise.resolve();
let lastCallAt = 0;
const MIN_INTERVAL_MS = 1100;
const USER_AGENT = "LetsDoItVietnam-CleanupMap/1.0 (+https://letsdoitvietnam.online; contact: letsdoitvietnam@gmail.com)";

async function callNominatim(url: string): Promise<any> {
  const run = async () => {
    const wait = Math.max(0, lastCallAt + MIN_INTERVAL_MS - Date.now());
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastCallAt = Date.now();
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': USER_AGENT },
    });
    if (!res.ok) throw new Error(`Nominatim responded with ${res.status}`);
    return res.json();
  };
  const result = queue.then(run, run);
  queue = result.then(() => undefined, () => undefined);
  return result;
}

router.get('/geocode/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) {
    res.json([]);
    return;
  }
  const limit = Math.min(Math.max(Number(req.query.limit) || 5, 1), 10);
  const wantPolygon = req.query.polygon === '1';
  const wantAddressDetails = req.query.addressdetails === '1';

  const url =
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}` +
    `&countrycodes=vn&format=json&limit=${limit}` +
    (wantPolygon ? '&polygon_geojson=1' : '') +
    (wantAddressDetails ? '&addressdetails=1' : '');

  try {
    const data = await callNominatim(url);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err?.message || 'Geocoding search failed' });
  }
});

router.get('/geocode/reverse', async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    res.status(400).json({ error: 'lat and lon are required' });
    return;
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

  try {
    const data = await callNominatim(url);
    res.json(data);
  } catch (err: any) {
    res.status(502).json({ error: err?.message || 'Reverse geocoding failed' });
  }
});

export default router;
