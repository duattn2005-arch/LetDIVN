import React, { useEffect, useMemo, useState } from 'react';
import '../../wp/videos.css';
import { dbService } from '../../services/dbService';
import { MediaVideo } from '../../types';

// "Take Action / Capturing Change, One Frame at a Time" and the video block of
// letsdoitvietnam.org's homepage: the markup and CSS of its [ldivn_videos]
// shortcode (wordpress-plugins/plugins/ldivn-cleanup-map/includes/videos.php),
// with year chips over the list.

/** Years of videos whose title has none (YouTube upload date). */
const KNOWN_YEARS: Record<string, number> = { n8NavDVZYHA: 2023 };

/** Chip colours by year: [bg, text, hover bg, hover text]. */
const PALETTE = [
  ['#e0f2fe', '#0369a1', '#0284c7', '#ffffff'],
  ['#fce7f3', '#be185d', '#e81a7f', '#ffffff'],
  ['#ffedd5', '#c2410c', '#ea580c', '#ffffff'],
  ['#dcfce7', '#15803d', '#16a34a', '#ffffff'],
  ['#ede9fe', '#6d28d9', '#7c3aed', '#ffffff'],
  ['#fef3c7', '#b45309', '#d97706', '#ffffff'],
];

const yearOf = (v: MediaVideo) => {
  const m = v.title.match(/(?<!\d)(20\d\d)(?!\d)/);
  return m ? Number(m[1]) : KNOWN_YEARS[v.youtubeId] ?? 0;
};

const chipStyle = (year: number) => {
  const [bg, text, hbg, htext] = year ? PALETTE[year % PALETTE.length] : ['#f1f5f9', '#475569', '#475569', '#ffffff'];
  return { '--ldmv-bg': bg, '--ldmv-text': text, '--ldmv-hbg': hbg, '--ldmv-htext': htext } as React.CSSProperties;
};

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" /></svg>
);
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15 5-3-5-3z" /></svg>
);

export const HomeVideos: React.FC = () => {
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [year, setYear] = useState<number | null>(null);
  const [current, setCurrent] = useState<MediaVideo | null>(null);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    const refresh = () => dbService.getVideos().then(setVideos);
    refresh();
    return dbService.subscribe(refresh);
  }, []);

  // Year chips, newest first ("Khác" last); the newest year is chosen at first.
  const years = useMemo(() => {
    const counts = new Map<number, number>();
    videos.forEach((v) => counts.set(yearOf(v), (counts.get(yearOf(v)) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[0] - a[0]);
  }, [videos]);
  const filter = years.length > 1;
  const shownYear = filter ? year ?? years[0][0] : null;
  const shown = videos.filter((v) => shownYear === null || yearOf(v) === shownYear);
  const playing = current && videos.some((v) => v.id === current.id) ? current : shown[0];

  if (videos.length === 0 || !playing) return null;

  return (
    <section className="px-2.5 pt-[60px] pb-5">
      <div className="text-center mb-[30px]">
        <p className="font-['Poppins'] text-[18px] font-medium leading-[23.8px] text-[#7A7A7A] mb-2.5">Take Action</p>
        <h2 className="ref-heading ref-title-lg" style={{ color: '#F1138D', fontWeight: 400 }}>
          Capturing Change, One Frame at a Time
        </h2>
      </div>

      <div className="ldmv ldmv--ready">
        <div className="ldmv-list ldmv-card">
          <div className="ldmv-list-in">
            <div className="ldmv-head">
              <span className="ldmv-count"><YoutubeIcon /><span className="ldmv-num">{shown.length}</span> Videos</span>
              <span className="ldmv-hd">HD 1080p</span>
            </div>
            {filter && (
              <div className="ldmv-years" role="group" aria-label="Lọc theo năm">
                {years.map(([y, n]) => (
                  <button
                    key={y}
                    type="button"
                    className={`ldmv-year${y === shownYear ? ' is-active' : ''}`}
                    aria-pressed={y === shownYear}
                    style={chipStyle(y)}
                    onClick={() => { setCurrent(playing); setYear(y); }}
                  >
                    {y || 'Khác'}<span className="ldmv-year-n">{n}</span>
                  </button>
                ))}
              </div>
            )}
            <div className="ldmv-items">
              {shown.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`ldmv-item${v.id === playing.id ? ' is-active' : ''}`}
                  aria-current={v.id === playing.id ? 'true' : undefined}
                  onClick={() => { setCurrent(v); setAutoplay(true); }}
                >
                  <span className="ldmv-thumb">
                    <img src={`https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`} alt="" loading="lazy" />
                    <span className="ldmv-play"><PlayIcon /></span>
                  </span>
                  <span className="ldmv-item-title">{v.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="ldmv-player ldmv-card">
          <div className="ldmv-frame">
            <iframe
              key={playing.id}
              src={`https://www.youtube.com/embed/${encodeURIComponent(playing.youtubeId)}${autoplay ? '?autoplay=1' : ''}`}
              title={playing.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <div className="ldmv-bar">
            <div className="ldmv-now-wrap"><span className="ldmv-dot" /><h3 className="ldmv-now">{playing.title}</h3></div>
            <span className="ldmv-badge">YouTube Player</span>
          </div>
        </div>
      </div>
    </section>
  );
};
