import React from 'react';
import { PROJECT_STATIC_CONTENT } from '../data/projectStaticContent';

const BRAND_PINK = '#F1138D';
const BRAND_AMBER = '#FEAC13';
const BAND_GRAY = '#F2F2F2';

/**
 * Renders the "about this campaign" content mirrored from the matching page
 * on letsdoitvietnam.org, shown above the registration/map section for
 * projects whose category has a matching entry.
 *
 * Typography and layout are matched to the reference site's Elementor/Divi
 * build: "Chau Philomene One" (weight 500) for every heading, "Poppins" for
 * body copy, plain (non-rounded, no shadow) photos, and full-bleed
 * alternating gray/white bands for each image+text section.
 */
export const ProjectStaticContent: React.FC<{ category: string }> = ({ category }) => {
  const content = PROJECT_STATIC_CONTENT[category];
  if (!content) return null;

  const titleColor = content.titleColor || BRAND_PINK;

  return (
    <div className="bg-white">
      <div className="w-full aspect-21/9 sm:h-[280px] sm:aspect-auto bg-slate-900">
        <img src={content.hero} alt={content.title} className="w-full h-full object-cover" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-3 text-center">
        {content.kicker && (
          <h3
            className="ref-heading text-xl sm:text-2xl"
            style={{ color: BRAND_AMBER }}
          >
            {content.kicker}
          </h3>
        )}
        <h2
          className="ref-heading text-3xl sm:text-4xl lg:text-[45px]"
          style={{ color: titleColor }}
        >
          {content.title}
        </h2>
      </div>

      <div>
        {content.sections.map((section, idx) => {
          const hasImage = !!section.image;
          const isImageLeft = idx % 2 === 0;
          const isBulletList = section.paragraphs.length > 2 && section.paragraphs.every((p) => p.length < 160);
          const bandBg = idx % 2 === 0 ? BAND_GRAY : 'transparent';

          const textBlock = (
            <div className="space-y-3 text-center">
              {section.heading && (
                <h3 className="ref-heading text-xl sm:text-2xl text-left" style={{ color: BRAND_AMBER }}>
                  {section.heading}
                </h3>
              )}
              {isBulletList ? (
                <ul className="space-y-2 text-left">
                  {section.paragraphs.map((p, i) => (
                    <li key={i} className="ref-body text-sm text-slate-600 leading-relaxed flex gap-2">
                      <span style={{ color: BRAND_AMBER }} className="shrink-0">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                section.paragraphs.map((p, i) => (
                  <p key={i} className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed">{p}</p>
                ))
              )}
            </div>
          );

          if (!hasImage) {
            return (
              <div key={idx} style={{ backgroundColor: bandBg }} className="py-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">{textBlock}</div>
              </div>
            );
          }

          return (
            <div key={idx} style={{ backgroundColor: bandBg }} className="py-10">
              <div
                className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 gap-10 items-center ${
                  isImageLeft ? 'md:grid-cols-[0.85fr_1.15fr]' : 'md:grid-cols-[1.15fr_0.85fr]'
                }`}
              >
                <div className={isImageLeft ? 'order-1' : 'order-1 md:order-2'}>
                  <img
                    src={section.image}
                    alt={section.heading || content.title}
                    className="w-full aspect-3/2 object-cover"
                  />
                </div>
                <div className={isImageLeft ? 'order-2' : 'order-2 md:order-1'}>{textBlock}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
