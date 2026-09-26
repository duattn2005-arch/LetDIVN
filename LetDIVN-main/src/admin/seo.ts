import { slugify } from './util';

// Yoast-style content checks for the SEO box: each check is good (green),
// ok (orange) or bad (red), and the overall score is shown in the Publish box.

export type Rating = 'good' | 'ok' | 'bad';
export interface Check {
  rating: Rating;
  text: string;
}

export interface SeoInput {
  keyphrase: string;
  title: string;
  seoTitle: string;
  description: string;
  slug: string;
  /** The body as HTML (images, links and headings are counted from it). */
  html: string;
  /** The body as plain text, one paragraph per blank line. */
  text: string;
}

const words = (s: string) => s.trim().split(/\s+/).filter(Boolean);
const lower = (s: string) => s.toLocaleLowerCase('vi');
const countOf = (haystack: string, needle: string) => (needle ? lower(haystack).split(lower(needle)).length - 1 : 0);

export const SITE_HOST = 'letsdoitvietnam.online';

export function seoChecks(input: SeoInput): Check[] {
  const { keyphrase, description, slug, html, text } = input;
  const title = input.seoTitle || input.title;
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const wordCount = words(text).length;
  const kp = keyphrase.trim();
  const checks: Check[] = [];

  if (!kp) {
    checks.push({ rating: 'bad', text: 'Chưa đặt cụm từ khóa chính. Hãy nhập cụm từ bạn muốn bài viết được tìm thấy trên Google.' });
  } else {
    const inTitle = lower(title).indexOf(lower(kp));
    checks.push(
      inTitle === 0
        ? { rating: 'good', text: 'Cụm từ khóa nằm ở đầu tiêu đề SEO. Tốt lắm!' }
        : inTitle > 0
          ? { rating: 'ok', text: 'Cụm từ khóa có trong tiêu đề SEO nhưng không ở đầu. Nên đưa lên đầu.' }
          : { rating: 'bad', text: 'Tiêu đề SEO chưa có cụm từ khóa chính.' }
    );
    const intro = text.split(/\n{2,}/).find((p) => p.trim()) ?? '';
    checks.push(
      countOf(intro, kp)
        ? { rating: 'good', text: 'Cụm từ khóa xuất hiện ngay trong đoạn đầu tiên.' }
        : { rating: 'bad', text: 'Đoạn đầu tiên chưa có cụm từ khóa chính.' }
    );
    checks.push(
      countOf(description, kp)
        ? { rating: 'good', text: 'Mô tả meta có chứa cụm từ khóa.' }
        : { rating: 'bad', text: 'Mô tả meta chưa có cụm từ khóa chính.' }
    );
    const kpSlug = slugify(kp);
    checks.push(
      kpSlug && slug.includes(kpSlug)
        ? { rating: 'good', text: 'Đường dẫn có chứa cụm từ khóa.' }
        : { rating: 'ok', text: 'Đường dẫn (slug) chưa chứa cụm từ khóa.' }
    );
    const occurrences = countOf(text, kp);
    const density = wordCount ? (occurrences * words(kp).length * 100) / wordCount : 0;
    checks.push(
      density >= 0.5 && density <= 3
        ? { rating: 'good', text: `Cụm từ khóa xuất hiện ${occurrences} lần, mật độ vừa phải.` }
        : density > 3
          ? { rating: 'bad', text: `Cụm từ khóa xuất hiện ${occurrences} lần — quá dày, nghe như nhồi từ khóa.` }
          : { rating: 'ok', text: `Cụm từ khóa mới xuất hiện ${occurrences} lần. Nên nhắc lại thêm vài lần trong bài.` }
    );
    const headings = [...doc.querySelectorAll('h2, h3')].map((h) => h.textContent || '');
    if (headings.length)
      checks.push(
        headings.some((h) => countOf(h, kp))
          ? { rating: 'good', text: 'Có tiêu đề phụ (H2/H3) chứa cụm từ khóa.' }
          : { rating: 'ok', text: 'Chưa có tiêu đề phụ (H2/H3) nào chứa cụm từ khóa.' }
      );
  }

  const descLength = description.trim().length;
  checks.push(
    !descLength
      ? { rating: 'bad', text: 'Chưa có mô tả meta. Google sẽ tự lấy một đoạn trong bài.' }
      : descLength < 120
        ? { rating: 'ok', text: `Mô tả meta hơi ngắn (${descLength} ký tự). Nên 120–156 ký tự.` }
        : descLength > 156
          ? { rating: 'ok', text: `Mô tả meta hơi dài (${descLength} ký tự), Google sẽ cắt bớt. Nên 120–156 ký tự.` }
          : { rating: 'good', text: 'Độ dài mô tả meta rất tốt.' }
  );
  checks.push(
    title.length > 60
      ? { rating: 'ok', text: `Tiêu đề SEO dài ${title.length} ký tự, Google có thể cắt bớt. Nên dưới 60.` }
      : title.length < 20
        ? { rating: 'ok', text: 'Tiêu đề SEO hơi ngắn.' }
        : { rating: 'good', text: 'Độ dài tiêu đề SEO rất tốt.' }
  );
  checks.push(
    wordCount >= 300
      ? { rating: 'good', text: `Bài viết có ${wordCount} từ. Tốt lắm!` }
      : wordCount >= 150
        ? { rating: 'ok', text: `Bài viết có ${wordCount} từ, hơi ngắn. Nên từ 300 từ trở lên.` }
        : { rating: 'bad', text: `Bài viết chỉ có ${wordCount} từ. Nên viết từ 300 từ trở lên.` }
  );
  checks.push(
    doc.querySelector('img')
      ? { rating: 'good', text: 'Bài viết có hình ảnh.' }
      : { rating: 'bad', text: 'Bài viết chưa có hình ảnh nào.' }
  );
  const links = [...doc.querySelectorAll('a[href]')].map((a) => a.getAttribute('href') || '');
  const outbound = links.filter((h) => /^https?:\/\//.test(h) && !h.includes(SITE_HOST));
  const internal = links.filter((h) => h.startsWith('/') || h.includes(SITE_HOST));
  checks.push(
    outbound.length
      ? { rating: 'good', text: 'Có liên kết ra trang web khác.' }
      : { rating: 'ok', text: 'Chưa có liên kết nào ra trang web khác.' }
  );
  checks.push(
    internal.length
      ? { rating: 'good', text: 'Có liên kết tới trang khác trên website.' }
      : { rating: 'ok', text: 'Chưa có liên kết nội bộ (tới trang khác trên letsdoitvietnam.online).' }
  );
  return checks;
}

export function readabilityChecks(input: SeoInput): Check[] {
  const { text, html } = input;
  const checks: Check[] = [];
  const paragraphs = text.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const sentences = text.split(/(?<=[.!?…])\s+|\n+/).map((s) => s.trim()).filter((s) => words(s).length > 0);
  const wordCount = words(text).length;

  const longSentences = sentences.filter((s) => words(s).length > 25).length;
  const share = sentences.length ? (longSentences * 100) / sentences.length : 0;
  checks.push(
    share <= 25
      ? { rating: 'good', text: 'Độ dài câu vừa phải.' }
      : share <= 40
        ? { rating: 'ok', text: `${Math.round(share)}% số câu dài hơn 25 từ. Nên viết câu ngắn hơn.` }
        : { rating: 'bad', text: `${Math.round(share)}% số câu dài hơn 25 từ — quá nhiều câu dài.` }
  );
  const longParagraphs = paragraphs.filter((p) => words(p).length > 150).length;
  checks.push(
    longParagraphs
      ? { rating: 'ok', text: `Có ${longParagraphs} đoạn dài hơn 150 từ. Nên chia nhỏ.` }
      : { rating: 'good', text: 'Độ dài các đoạn văn vừa phải.' }
  );
  const hasHeadings = /<h[2-4][\s>]/i.test(html);
  checks.push(
    wordCount > 300 && !hasHeadings
      ? { rating: 'bad', text: 'Bài dài nhưng chưa có tiêu đề phụ. Nên chia bài bằng các tiêu đề (H2, H3).' }
      : { rating: 'good', text: 'Cách chia tiêu đề phụ hợp lý.' }
  );
  const firstPara = paragraphs[0] ?? '';
  checks.push(
    words(firstPara).length > 80
      ? { rating: 'ok', text: 'Đoạn mở đầu khá dài. Đoạn đầu ngắn giúp người đọc nắm ý nhanh hơn.' }
      : { rating: 'good', text: 'Đoạn mở đầu ngắn gọn.' }
  );
  return checks;
}

export type Overall = { rating: Rating | 'none'; label: string };

export function overall(checks: Check[], needsKeyphrase = false, keyphrase = ''): Overall {
  if (needsKeyphrase && !keyphrase.trim()) return { rating: 'none', label: 'Chưa phân tích' };
  const points = { good: 9, ok: 6, bad: 3 };
  const score = checks.length ? checks.reduce((s, c) => s + points[c.rating], 0) / (checks.length * 9) : 0;
  return score >= 0.8 ? { rating: 'good', label: 'Tốt' } : score >= 0.6 ? { rating: 'ok', label: 'OK' } : { rating: 'bad', label: 'Cần cải thiện' };
}

export const RATING_COLOR: Record<Rating | 'none', string> = { good: '#7ad03a', ok: '#ee7c1b', bad: '#dc3232', none: '#a7aaad' };
