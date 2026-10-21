import React, { useEffect, useMemo, useRef } from 'react';
import '../../wp/stats.css';
import { init } from '../../wp/stats-init.js';

// World Cleanup Day, year by year: the three photo cards of letsdoitvietnam.org's
// homepage, the same markup, CSS and script as its [ldivn_wcd_stats] shortcode
// (wordpress-plugins/plugins/ldivn-cleanup-map/includes/stats.php).

/** year => [volunteers, waste collected in kg, press articles], as on the website. */
const YEARS: Record<number, [number, number, number]> = {
  2017: [1200, 4000, 5],
  2018: [3500, 12000, 12],
  2019: [12000, 35000, 45],
  2020: [8200, 21000, 30],
  2021: [5600, 14500, 22],
  2022: [15000, 40000, 58],
  2023: [18500, 48000, 64],
  2024: [22000, 55500, 70],
  2025: [26000, 62000, 85],
  2026: [30000, 70000, 90],
};

const CARDS = [
  { key: 'volunteers', title: 'Volunteers', sub: 'Individuals making a difference', accent: '#d8b4fe', image: '/wp/stats-volunteers.jpg',
    icon: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
  { key: 'waste', title: 'Waste Collected', sub: 'Removed from the environment', accent: '#fcd34d', image: '/wp/stats-waste.jpg',
    icon: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>' },
  { key: 'press', title: 'Press Coverage', sub: 'Articles and broadcasts amplifying our impact', accent: '#f9a8d4', image: '/wp/stats-press.jpg',
    icon: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>' },
];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A figure as a card shows it: [number, unit]; waste from 1,000 kg on in tons. */
function format(key: string, n: number): [string, string] {
  if (key === 'waste' && n >= 1000) {
    const tons = (n / 1000).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).replace(/\.0$/, '');
    return [tons, tons === '1' ? 'ton' : 'tons'];
  }
  return [n.toLocaleString('en-US'), key === 'waste' ? 'kg' : ''];
}

function render(interval = 4): string {
  const years = Object.keys(YEARS).map(Number).sort((a, b) => a - b).slice(-10);
  const start = 0;
  const figures: [string, string][][] = [];
  const raw: number[][] = [];
  let cards = '';

  CARDS.forEach((card, c) => {
    const values = years.map((y) => YEARS[y][c]);
    const max = Math.max(1, ...values);
    const shown = values.map((v) => format(card.key, v));
    figures.push(shown);
    raw.push(values);

    const bars = years
      .map((y, i) => {
        const tip = `${y} · ${shown[i].join(' ').trim()}`;
        return `<span class="ldms-b${i === start ? ' is-on' : ''}" data-i="${i}" data-tip="${esc(tip)}">`
          + `<span class="ldms-track"><i style="height:${Math.max(4, Math.round((values[i] / max) * 100))}%"></i></span>`
          + `<em>&rsquo;${String(y).slice(-2)}</em></span>`;
      })
      .join('');
    const [num, unit] = shown[start];
    const figure = `<span class="ldms-num">${esc(num)}</span><span class="ldms-unit">${esc(unit)}</span>`;
    cards += `<article class="ldms-card" style="--ldms-accent:${card.accent}" aria-label="${esc(card.title)}">`
      + `<img class="ldms-photo" src="${card.image}" alt="" loading="lazy" decoding="async">`
      + '<span class="ldms-shade"></span>'
      + '<div class="ldms-top">'
      + `<span class="ldms-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${card.icon}</svg></span>`
      + '<span class="ldms-when"><span class="ldms-event">World Cleanup Day</span>'
      + `<span class="ldms-swap ldms-year"><span class="is-on">${years[start]}</span><span aria-hidden="true"></span></span>`
      + '</span></div>'
      + '<div class="ldms-body">'
      + `<div class="ldms-swap ldms-value"><span class="is-on">${figure}</span><span aria-hidden="true">${figure}</span></div>`
      + `<div class="ldms-title">${esc(card.title)}</div>`
      + `<div class="ldms-sub">${esc(card.sub)}</div>`
      + `<div class="ldms-chart">${bars}</div>`
      + '</div></article>';
  });

  const config = { interval: interval * 1000, start, years, keys: CARDS.map((c) => c.key), cards: figures, raw };
  return `<div class="ldms" data-ldms="${esc(JSON.stringify(config))}">`
    + `<div class="ldms-cards">${cards}</div>`
    + '<span class="ldms-clock" aria-hidden="true"></span>'
    + '</div>';
}

export const WcdStats: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const html = useMemo(() => render(), []);

  useEffect(() => {
    const root = ref.current?.querySelector<HTMLElement>('.ldms');
    if (root && !root.classList.contains('ldms--ready')) {
      root.classList.add('ldms--ready');
      init(root);
    }
  }, []);

  return (
    <section className="py-[30px] px-2.5">
      <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
};
