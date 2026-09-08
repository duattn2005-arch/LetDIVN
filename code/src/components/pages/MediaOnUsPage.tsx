import React from 'react';
import { Newspaper, Radio, Download } from 'lucide-react';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { TakeActionStrip } from '../TakeActionStrip';
import { MEDIA_ON_US_ENTRIES } from '../../data/mediaOnUsData';

const BRAND_PINK = '#F1138D';

export const MediaOnUsPage: React.FC = () => {
  return (
    <div className="bg-white">

      {/* Full-width hero banner */}
      <EditableImage
        contentKey="mediaOnUsPage.heroImage"
        defaultValue="/images/media-on-us/m07.jpg"
        alt="Media coverage"
        wrapperClassName="w-full aspect-21/9 sm:h-[300px] sm:aspect-auto bg-slate-900"
        className="w-full h-full object-cover"
      />

      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        <div className="text-center max-w-3xl mx-auto space-y-4">
          <EditableText
            contentKey="mediaOnUsPage.title"
            defaultValue="Media on Us"
            as="h1"
            className="ref-heading text-3xl sm:text-4xl lg:text-[45px] [text-wrap:balance]"
            render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
          />
          <EditableText
            contentKey="mediaOnUsPage.subtitle"
            defaultValue="We are delighted to have received enthusiastic and proactive support from the press network in Vietnam. We firmly believe that achieving significant goals is possible only with community support through the influence of the press and social media."
            as="p"
            className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed [text-wrap:balance]"
            multiline
          />
        </div>

        <div className="space-y-6">
          {MEDIA_ON_US_ENTRIES.map((entry, idx) => (
            <div
              key={entry.title}
              className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] items-center gap-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 sm:p-5"
            >
              <div className="flex items-center gap-4">
                <img
                  src={entry.image}
                  alt={entry.title}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shrink-0"
                />
                <h3 className="ref-heading text-base sm:text-lg text-slate-900 leading-snug">{entry.title}</h3>
              </div>

              <div className="flex items-center gap-6 sm:gap-8 justify-center">
                <div className="text-center">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Newspaper className="w-4 h-4" style={{ color: BRAND_PINK }} />
                    <span className="text-2xl sm:text-3xl font-black" style={{ color: BRAND_PINK }}>{entry.articles}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Article{entry.articles !== 1 ? 's' : ''}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Radio className="w-4 h-4 text-orange-500" />
                    <span className="text-2xl sm:text-3xl font-black text-orange-500">{entry.segments}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Segment{entry.segments !== 1 ? 's' : ''}</div>
                </div>
              </div>

              <a
                href={entry.pdf}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center sm:items-end gap-1 shrink-0"
              >
                <span
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: BRAND_PINK }}
                >
                  <Download className="w-3.5 h-3.5" />
                  {entry.title}
                </span>
                <span className="text-[10px] text-slate-400">Click to see media coverage on activities</span>
              </a>
            </div>
          ))}
        </div>

      </div>

      <TakeActionStrip contentKeyPrefix="mediaOnUsPage" />
    </div>
  );
};
