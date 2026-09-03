/**
 * Detects known in-app WebView browsers (Messenger, Instagram, Zalo, TikTok, ...)
 * that Google's sign-in script refuses to run inside for security reasons.
 * Used to steer users toward login methods that actually work there
 * (email/password, Facebook) instead of a Google button doomed to fail.
 */
export function isInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /FBAN|FBAV|Instagram|Line\/|Zalo|MicroMessenger|TikTok|musical_ly|; wv\)/i.test(navigator.userAgent);
}
