/** Extracts the 11-character video ID from any common YouTube URL shape, or null if not recognized. */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const match = url
    .trim()
    .match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

export function getYouTubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube.com/embed/${youtubeId}`;
}

/**
 * Fetches the real video title via YouTube's public oEmbed endpoint (no API key
 * needed, CORS-enabled). Returns null if the video is private/deleted or the
 * request fails, so callers can fall back to a generic title.
 */
export async function fetchYouTubeTitle(youtubeId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${youtubeId}`)}&format=json`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.title || null;
  } catch {
    return null;
  }
}


