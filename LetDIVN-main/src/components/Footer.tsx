import React from 'react';
import '../wp/footer.css';

// The footer of letsdoitvietnam.org: a pink "People for a clean planet!" card,
// then the logo and three columns of links on the header's dark blue, then the
// copyright line. Same markup and CSS as the WordPress plugin's footer
// (wordpress-plugins/plugins/ldivn-cleanup-map/includes/footer.php).

interface FooterProps {
  onNavigate: (view: any, extraId?: string) => void;
  onOpenVolunteer?: () => void;
  onOpenPartner?: () => void;
}

/** [text, app view or address] — a view opens in the app, an address loads that page. */
const COLUMNS: [string, [string, string][]][] = [
  ['About', [
    ['Who We Are', 'who-we-are'],
    ['What We Do', 'what-we-do'],
    ['Our Team', 'our-team'],
    ['Our Partners', 'our-partners'],
    ['Media Coverage', 'media-on-us'],
  ]],
  ['Campaigns', [
    ['World Cleanup Day', '/world-cleanup-day/'],
    ['Environmental Day', '/environmental-day/'],
    ['Green Ocean Campaign', '/green-ocean-campaign/'],
    ['Community Workshop', '/community-workshop/'],
    ['Young Conservationists Save the Wildlife', '/ycsw/'],
  ]],
  ['Get Involved', [
    ['Volunteer', '#volunteer'],
    ['Cleanup Map', 'map'],
    ['News', 'news'],
    ['Contact Us', 'contact'],
  ]],
];

const VIEW_URLS: Record<string, string> = {
  'who-we-are': '/who-we-are/', 'what-we-do': '/what-we-do/', 'our-team': '/our-team/', 'our-partners': '/our-partners/',
  'media-on-us': '/media-on-us/', map: '/cleanup-map/', news: '/news/', contact: '/contact/',
};

const SOCIAL: [string, string, string][] = [
  ['Facebook', 'https://www.facebook.com/LetsDoItVietNam', 'M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07'],
  ['Instagram', 'https://www.instagram.com/letsdoitvietnam/', 'M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98 1.28.06 1.69.07 4.95.07s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z'],
  ['Email', 'mailto:letsdoitvietnam@gmail.com', 'M3 5h18a1 1 0 0 1 1 1v.4l-10 6.25L2 6.4V6a1 1 0 0 1 1-1zm-1 3.75V18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V8.75l-9.47 5.92a1 1 0 0 1-1.06 0z'],
];

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenVolunteer }) => {
  const link = (target: string) => {
    if (target === '#volunteer') {
      return { href: '#volunteer', onClick: (e: React.MouseEvent) => { e.preventDefault(); onOpenVolunteer?.(); } };
    }
    if (target.startsWith('/')) return { href: target };
    return { href: VIEW_URLS[target] || '/', onClick: (e: React.MouseEvent) => { e.preventDefault(); onNavigate(target); } };
  };

  return (
    <footer className="ldf" role="contentinfo">
      <div className="ldf-cta">
        <div className="ldf-in">
          <div className="ldf-cta-card">
            <p className="ldf-cta-t">
              <span className="ldf-cta-ic" aria-hidden="true">
                <svg viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="M58 4C30 4 12 14 9 36c-1 7 1 13 4 18L6 61l3 2 7-7c5 3 11 4 17 2C52 52 60 30 58 4zM18 50c8-14 18-24 30-33-10 10-18 20-26 36z" /></svg>
              </span>
              People for a clean planet!
            </p>
            <a className="ldf-btn" {...link('#volunteer')}>
              Get Involved
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="ldf-main">
        <div className="ldf-in ldf-grid">
          <div className="ldf-brand">
            <a className="ldf-logo" href="/" aria-label="Let’s do it! Vietnam" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
              <img src="/wp/logo-footer.png" alt="" width={720} height={246} loading="lazy" decoding="async" />
            </a>
            <p className="ldf-tag">Together for a cleaner Vietnam.</p>
            <p className="ldf-about">We mobilize volunteers, raise environmental awareness, and build community action for a greener, healthier Vietnam.</p>
          </div>
          {COLUMNS.map(([title, links]) => (
            <nav className="ldf-col" aria-label={title} key={title}>
              <h3 className="ldf-h">{title}</h3>
              <ul>
                {links.map(([text, target]) => (
                  <li key={text}><a {...link(target)}>{text}</a></li>
                ))}
              </ul>
              {title === 'Get Involved' && (
                <div className="ldf-social">
                  {SOCIAL.map(([name, url, d]) => (
                    <a key={name} href={url} aria-label={name} title={name} {...(url.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={d} /></svg>
                    </a>
                  ))}
                </div>
              )}
            </nav>
          ))}
        </div>
      </div>

      <div className="ldf-bottom">
        <div className="ldf-in ldf-bottom-in">
          <p>© {new Date().getFullYear()} Let’s Do It! Vietnam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
