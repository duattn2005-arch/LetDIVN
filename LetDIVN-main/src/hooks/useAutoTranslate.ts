import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translateText } from '../services/translateService';

// For admin-entered free text (activity descriptions, highlights, etc.) that
// has no per-language translation of its own — unlike the site's fixed UI
// chrome, which already goes through LanguageContext. Shows the original
// text immediately (so nothing is ever blank while a request is in flight,
// and Vietnamese never bothers translating at all) then swaps in the
// translated version once it resolves.
export function useAutoTranslate(text: string): string {
  const { language } = useLanguage();
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let cancelled = false;
    setDisplayText(text);

    if (language === 'vi' || !text?.trim()) return;

    translateText(text, language).then((translated) => {
      if (!cancelled) setDisplayText(translated);
    });

    return () => {
      cancelled = true;
    };
  }, [text, language]);

  return displayText;
}

// Same idea for a list of short strings (e.g. bullet-point highlights) —
// joined into one request instead of one API call per line. Falls back to
// the original list if the translated line count doesn't match (a sign the
// translation reflowed the text rather than keeping one line per item).
export function useAutoTranslateList(items: string[]): string[] {
  const { language } = useLanguage();
  const [displayItems, setDisplayItems] = useState(items);
  const joined = items.join('\n');

  useEffect(() => {
    let cancelled = false;
    setDisplayItems(items);

    if (language === 'vi' || items.length === 0) return;

    translateText(joined, language).then((translated) => {
      if (cancelled) return;
      const split = translated.split('\n');
      setDisplayItems(split.length === items.length ? split : items);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joined, language]);

  return displayItems;
}
