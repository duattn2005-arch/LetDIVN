import { Router } from 'express';

// Proxies OSM Nominatim / Photon through our own server instead of letting
// the browser call them directly. That fixes two real problems seen with
// direct client-side calls: (1) ad blockers / privacy extensions / some ISPs
// block third-party domains like nominatim.openstreetmap.org outright, which
// no client-side retry can work around; (2) repeated identical searches
// (e.g. many visitors searching the same district) each cost a fresh round
// trip. This route adds a short in-memory cache so a repeat query is
// answered instantly from our own server.
//
// A descriptive User-Agent identifying the app is required by Nominatim's
// usage policy (https://operations.osmfoundation.org/policies/nominatim/).
const NOMINATIM_UA = "LetsDoItVietnam/1.0 (https://letsdoitvietnam.online)";

interface CacheEntry {
  body: unknown;
  expires: number;
}
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — boundaries don't change
const cache = new Map<string, CacheEntry>();

function getCached(key: string): unknown | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expires < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.body;
}

function setCached(key: string, body: unknown): void {
  cache.set(key, { body, expires: Date.now() + CACHE_TTL_MS });
  // Simple unbounded-growth guard — this is a low-traffic map feature, not a
  // high-volume cache, so a coarse cap is enough.
  if (cache.size > 500) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
}

const router = Router();

router.get('/geocode/search', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) {
    res.status(400).json({ error: 'Missing q' });
    return;
  }
  const cacheKey = `search:${q}:${req.query.viewbox || ''}`;
  const cached = getCached(cacheKey);
  if (cached !== undefined) {
    res.json(cached);
    return;
  }

  const params = new URLSearchParams({
    q,
    countrycodes: 'vn',
    format: 'json',
    addressdetails: '1',
    polygon_geojson: '1',
    limit: String(req.query.limit || '1'),
  });
  if (req.query.viewbox) {
    params.set('viewbox', String(req.query.viewbox));
    params.set('bounded', '1');
  }

  try {
    const upstream = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'User-Agent': NOMINATIM_UA, 'Accept-Language': 'en' },
    });
    if (!upstream.ok) {
      res.status(502).json({ error: 'Nominatim upstream error' });
      return;
    }
    const data = await upstream.json();
    setCached(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.warn('Nominatim proxy search error:', err);
    res.status(502).json({ error: 'Nominatim unreachable' });
  }
});

router.get('/geocode/reverse', async (req, res) => {
  const lat = String(req.query.lat || '');
  const lon = String(req.query.lon || '');
  if (!lat || !lon) {
    res.status(400).json({ error: 'Missing lat/lon' });
    return;
  }
  const cacheKey = `reverse:${lat}:${lon}`;
  const cached = getCached(cacheKey);
  if (cached !== undefined) {
    res.json(cached);
    return;
  }

  const params = new URLSearchParams({
    lat,
    lon,
    format: 'json',
    zoom: String(req.query.zoom || '18'),
    addressdetails: '1',
  });

  try {
    const upstream = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
      headers: { 'User-Agent': NOMINATIM_UA, 'Accept-Language': 'en' },
    });
    if (!upstream.ok) {
      res.status(502).json({ error: 'Nominatim upstream error' });
      return;
    }
    const data = await upstream.json();
    setCached(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.warn('Nominatim proxy reverse error:', err);
    res.status(502).json({ error: 'Nominatim unreachable' });
  }
});

router.get('/geocode/photon', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) {
    res.status(400).json({ error: 'Missing q' });
    return;
  }
  const cacheKey = `photon:${q}`;
  const cached = getCached(cacheKey);
  if (cached !== undefined) {
    res.json(cached);
    return;
  }

  const params = new URLSearchParams({
    q,
    limit: String(req.query.limit || '6'),
    bbox: '102.0,8.0,110.0,24.0',
    lang: 'en',
  });

  try {
    const upstream = await fetch(`https://photon.komoot.io/api/?${params}`);
    if (!upstream.ok) {
      res.status(502).json({ error: 'Photon upstream error' });
      return;
    }
    const data = await upstream.json();
    setCached(cacheKey, data);
    res.json(data);
  } catch (err) {
    console.warn('Photon proxy error:', err);
    res.status(502).json({ error: 'Photon unreachable' });
  }
});

export default router;
