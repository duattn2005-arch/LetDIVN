import { Language } from '../context/LanguageContext';

// Admin-entered content (activity descriptions, highlights, etc.) is free text
// typed in whatever language the admin happened to use — unlike the site's
// fixed UI chrome (buttons, nav, page titles), which already has real
// translations via LanguageContext. This auto-translates that free text on
// the fly so it still matches whatever language the visitor has selected,
// via Google's public translate endpoint (no API key, but unofficial — if it
// ever goes down or gets rate-limited, callers fall back to the original text
// rather than breaking the page).
const GOOGLE_LANG_CODE: Record<Language, string> = {
  vi: 'vi',
  en: 'en',
  fr: 'fr',
  ja: 'ja',
  ko: 'ko',
  zh: 'zh-CN',
  de: 'de',
  es: 'es',
};

// In-memory cache only — translations are deterministic for a given
// text+language pair, so repeated renders/navigations never re-fetch the
// same string twice in a session.
const cache = new Map<string, string>();
const inFlight = new Map<string, Promise<string>>();

async function translateViaGoogle(text: string, targetLang: string): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translate request failed (${res.status})`);
  const data = await res.json();
  // Response shape: [[[translatedChunk, originalChunk, ...], ...], ...] —
  // long text gets split into multiple segments that need re-joining.
  const segments = data?.[0];
  if (!Array.isArray(segments)) throw new Error('Unexpected translate response shape');
  return segments.map((seg: any) => seg?.[0] ?? '').join('');
}

export async function translateText(text: string, targetLanguage: Language): Promise<string> {
  const trimmed = text?.trim();
  if (!trimmed) return text;
  if (targetLanguage === 'vi') return text;

  const targetLang = GOOGLE_LANG_CODE[targetLanguage] || targetLanguage;
  const cacheKey = `${targetLang}::${text}`;

  const cached = cache.get(cacheKey);
  if (cached !== undefined) return cached;

  const pending = inFlight.get(cacheKey);
  if (pending) return pending;

  const promise = translateViaGoogle(text, targetLang)
    .then((translated) => {
      cache.set(cacheKey, translated);
      inFlight.delete(cacheKey);
      return translated;
    })
    .catch((err) => {
      console.warn('translateText: falling back to original text', err);
      inFlight.delete(cacheKey);
      return text;
    });

  inFlight.set(cacheKey, promise);
  return promise;
}
