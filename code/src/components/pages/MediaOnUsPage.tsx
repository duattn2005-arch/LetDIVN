import React from 'react';
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

        <div className="text-center max-w-5xl mx-auto space-y-4">
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

        <div className="space-y-10">
          {MEDIA_ON_US_ENTRIES.map((entry) => (
            <div
              key={entry.title}
              className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] items-center gap-6 sm:gap-10"
            >
              <img
                src={entry.image}
                alt={entry.title}
                className="w-full sm:w-56 aspect-16/10 object-cover"
              />

              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-black" style={{ color: BRAND_PINK }}>{entry.articles}</div>
                <div className="text-sm text-slate-500 mt-0.5">Article</div>
              </div>

              <div className="text-center">
                <div className="text-4xl sm:text-5xl font-black text-orange-500">{entry.segments}</div>
                <div className="text-sm text-slate-500 mt-0.5">Segment</div>
              </div>

              <a
                href={entry.pdf}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <span
                  className="inline-flex items-center px-6 py-2.5 rounded-full text-white text-sm font-bold shadow-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: BRAND_PINK }}
                >
                  {entry.title}
                </span>
                <span className="ref-body text-xs italic text-slate-400">Click to see media coverage on activities</span>
              </a>
            </div>
          ))}
        </div>

      </div>

      <TakeActionStrip contentKeyPrefix="mediaOnUsPage" />
    </div>
  );
};
