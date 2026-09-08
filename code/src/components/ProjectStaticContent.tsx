import React from 'react';
import { PROJECT_STATIC_CONTENT } from '../data/projectStaticContent';

const BRAND_PINK = '#F1138D';

/**
 * Renders the "about this campaign" content mirrored from the matching page
 * on letsdoitvietnam.org, shown above the registration/map section for
 * projects whose category has a matching entry.
 */
export const ProjectStaticContent: React.FC<{ category: string }> = ({ category }) => {
  const content = PROJECT_STATIC_CONTENT[category];
  if (!content) return null;

  return (
    <div className="bg-white">
      <div className="w-full aspect-21/9 sm:h-[280px] sm:aspect-auto bg-slate-900">
        <img src={content.hero} alt={content.title} className="w-full h-full object-cover" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-3 text-center">
        {content.kicker && (
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND_PINK }}>{content.kicker}</div>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: BRAND_PINK }}>{content.title}</h2>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 space-y-10">
        {content.sections.map((section, idx) => {
          const hasImage = !!section.image;
          const isImageLeft = idx % 2 === 0;
          const isBulletList = section.paragraphs.length > 2 && section.paragraphs.every((p) => p.length < 160);

          const textBlock = (
            <div className="space-y-2.5">
              {section.heading && (
                <h3 className="text-lg sm:text-xl font-bold" style={{ color: BRAND_PINK }}>{section.heading}</h3>
              )}
              {isBulletList ? (
                <ul className="space-y-1.5">
                  {section.paragraphs.map((p, i) => (
                    <li key={i} className="text-sm text-slate-600 leading-relaxed flex gap-2">
                      <span className="text-[#F1138D] shrink-0">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                section.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm sm:text-base text-slate-600 leading-relaxed">{p}</p>
                ))
              )}
            </div>
          );

          if (!hasImage) {
            return <div key={idx} className="max-w-3xl mx-auto">{textBlock}</div>;
          }

          return (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className={isImageLeft ? 'order-1' : 'order-1 md:order-2'}>
                <img
                  src={section.image}
                  alt={section.heading || content.title}
                  className="w-full aspect-4/3 object-cover rounded-2xl shadow-md"
                />
              </div>
              <div className={isImageLeft ? 'order-2' : 'order-2 md:order-1'}>{textBlock}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
