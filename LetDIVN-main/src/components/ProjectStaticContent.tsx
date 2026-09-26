import React, { useEffect, useState } from 'react';
import { CircleDot, PersonStanding } from 'lucide-react';
import { dbService } from '../services/dbService';
import { ProjectStaticContent as ProjectPage } from '../types';

const BRAND_PINK = '#F1138D';
const BRAND_AMBER = '#FEAC13';
const BAND_GRAY = '#F2F2F2';
const BULLET_BLUE = '#6EC1E4';

function aspectClass(a?: string) {
  switch (a) {
    case '7/2': return 'aspect-[7/2]';
    case '4/3': return 'aspect-4/3';
    case 'square': return 'aspect-square';
    default: return 'aspect-3/2';
  }
}

function galleryColsClass(n: number) {
  if (n <= 1) return 'grid-cols-1';
  if (n === 2) return 'grid-cols-1 sm:grid-cols-2';
  if (n === 3) return 'grid-cols-1 sm:grid-cols-3';
  return 'grid-cols-2 sm:grid-cols-3';
}

const Gallery: React.FC<{ images: string[]; alt: string; aspect?: string; className: string }> = ({ images, alt, aspect, className }) => (
  <div className={`grid ${galleryColsClass(images.length)} gap-2.5 ${className}`}>
    {images.map((src, i) => (
      <div key={i} className={`${aspectClass(aspect)} bg-slate-900 overflow-hidden`}>
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    ))}
  </div>
);

/**
 * Renders the "about this campaign" content mirrored from the matching page
 * on letsdoitvietnam.org, shown above the registration/map section for
 * projects whose category has a matching entry.
 *
 * Typography and layout are matched to the reference site's Elementor/Divi
 * build: "Chau Philomene One" (weight 500) for every heading, "Poppins" for
 * body copy, plain (non-rounded, no shadow) photos, and full-bleed
 * alternating gray/white bands for each image+text section. The whole page —
 * sections, paragraphs, images — is edited in Decap ("Dự án"), stored in
 * content/project-pages/<slug>.json.
 */
export const ProjectStaticContent: React.FC<{ category: string }> = ({ category }) => {
  const [pages, setPages] = useState<Record<string, ProjectPage> | null>(null);

  useEffect(() => {
    let cancelled = false;
    dbService.getProjectPages().then((p) => { if (!cancelled) setPages(p); }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const content = pages?.[category];
  if (!content) return null;

  const titleColor = content.titleColor || BRAND_PINK;
  // Left/right alternation only counts sections that actually have an image —
  // a heading-only or gallery-only section in between (verified against the
  // reference site) doesn't flip the side of the next real image band.
  let imageBandIndex = -1;

  return (
    <div className="bg-white">
      <div className="w-full aspect-21/9 sm:h-[484px] sm:aspect-auto bg-slate-900">
        <img src={content.hero} alt={content.title} className="w-full h-full object-cover" style={{ objectPosition: content.heroPosition || '50% 50%' }} />
      </div>

      <div className="max-w-6xl mx-auto px-[10px] sm:px-6 lg:px-8 py-12 space-y-3 text-center">
        {content.kicker && (
          <h3 className="block ref-heading text-xl sm:text-2xl whitespace-pre-line" style={{ color: BRAND_AMBER }}>{content.kicker}</h3>
        )}
        <h2 className="block ref-heading ref-title-xl whitespace-pre-line" style={{ color: titleColor }}>{content.title}</h2>
      </div>

      <div>
        {content.sections.map((section, idx) => {
          const hasImage = !!section.image;
          if (hasImage) imageBandIndex++;
          const isImageLeft = imageBandIndex % 2 === 0;
          const isBulletList = section.bulletList ?? (section.paragraphs.length > 2 && section.paragraphs.every((p) => p.length < 160));
          // Reference site centers only the title-adjacent intro blurb (no heading of its own)
          // and any title-style heading section. In an image+text band the text leans towards
          // the photo: left-aligned when the photo is on its left, right-aligned when the photo
          // is on its right (World Cleanup Day, Environmental Day); on phones, stacked, it is
          // left-aligned. Body paragraphs under an amber sub-heading are left-aligned too.
          const textAlign = hasImage
            ? isImageLeft
              ? 'text-left'
              : 'text-left md:text-right'
            : section.heading && !section.headingAsTitle
              ? 'text-left'
              : 'text-center';
          const bandBg = section.band ? (section.band === 'gray' ? BAND_GRAY : 'transparent') : idx % 2 === 0 ? BAND_GRAY : 'transparent';
          const paragraphStyle = section.textAlign ? { textAlign: section.textAlign } : undefined;

          const galleryBlock = section.gallery && section.gallery.length > 0 && (
            <Gallery images={section.gallery} alt={section.heading || content.title} aspect={section.galleryAspect} className="mt-6" />
          );

          // Two side-by-side sub-columns (e.g. "Main activities" | "Direct target audience")
          if (section.columns && section.columns.length > 0) {
            return (
              <div key={idx} style={{ backgroundColor: bandBg }} className="py-10">
                <div className="max-w-6xl mx-auto px-[10px] sm:px-6 lg:px-8 space-y-8">
                  {section.heading && (
                    <h3 className="block ref-heading text-xl sm:text-2xl text-left whitespace-pre-line" style={{ color: BRAND_AMBER }}>{section.heading}</h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {section.columns.map((col, ci) => (
                      <div key={ci} className="space-y-2">
                        {col.heading && (
                          <h4 className="ref-body font-semibold text-slate-800 text-left whitespace-pre-line">{col.heading}</h4>
                        )}
                        <ul className="space-y-1.5 text-left">
                          {col.paragraphs.map((p, pi) => (
                            <li key={pi} className="ref-text flex gap-2">
                              <CircleDot className="w-4 h-4 shrink-0 mt-0.5" style={{ color: BULLET_BLUE }} />
                              <span className="whitespace-pre-line">{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  {galleryBlock}
                </div>
              </div>
            );
          }

          // A single "icon + label" row (e.g. each participating organization on
          // the Community Workshop page) — its own full-width alternating band,
          // not a bulleted list.
          if (section.personListItem) {
            return (
              <div key={idx} style={{ backgroundColor: bandBg }} className="py-16">
                <div className="max-w-6xl mx-auto px-[10px] sm:px-6 lg:px-8 flex items-center gap-3">
                  <PersonStanding className="w-6.5 h-6.5 shrink-0" style={{ color: BRAND_PINK }} />
                  <span className="ref-body text-base" style={{ color: '#54595F' }}>{section.personListItem}</span>
                </div>
              </div>
            );
          }

          const textBlock = (
            <div className={`space-y-3 ${textAlign}`}>
              {section.heading && (
                <h3
                  className={`whitespace-pre-line ${
                    section.headingAsTitle
                      ? 'block ref-heading ref-title-xl text-center'
                      : 'block ref-heading text-xl sm:text-2xl text-left'
                  }`}
                  style={{ color: section.headingAsTitle ? titleColor : BRAND_AMBER }}
                >
                  {section.heading}
                </h3>
              )}
              {isBulletList ? (
                <ul className="space-y-2 text-left">
                  {section.paragraphs.map((p, i) => (
                    <li key={i} className="ref-text flex gap-2">
                      <CircleDot className="w-4 h-4 shrink-0 mt-0.5" style={{ color: BULLET_BLUE }} />
                      <span className="whitespace-pre-line">{p}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                section.paragraphs.map((p, i) => (
                  <p key={i} className="whitespace-pre-line ref-text" style={paragraphStyle}>
                    {p}
                  </p>
                ))
              )}

              {section.subBlocks && section.subBlocks.length > 0 && (
                <div className="text-left space-y-8 pt-2">
                  {section.subBlocks.map((block, bi) => (
                    <div key={bi} className="space-y-2">
                      {block.title && <p className="whitespace-pre-line ref-body text-sm sm:text-base font-bold text-slate-700">{block.title}</p>}
                      {block.text && <p className="whitespace-pre-line ref-text">{block.text}</p>}
                      {block.gallery && block.gallery.length > 0 && (
                        <Gallery images={block.gallery} alt={block.title} aspect={block.galleryAspect} className="pt-2" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {((section.closingParagraphs?.length ?? 0) > 0 || (section.closingBullets?.length ?? 0) > 0) && (
                <div className="text-left space-y-3 pt-2">
                  {section.closingParagraphs?.[0] && (
                    <p className="whitespace-pre-line ref-text">{section.closingParagraphs[0]}</p>
                  )}
                  {section.closingBullets && section.closingBullets.length > 0 && (
                    <>
                      {section.closingBulletsLabel && (
                        <p className="whitespace-pre-line ref-body text-sm sm:text-base font-bold text-slate-700">{section.closingBulletsLabel}</p>
                      )}
                      <ul className="space-y-1.5">
                        {section.closingBullets.map((p, i) => (
                          <li key={i} className="ref-text flex gap-2">
                            <CircleDot className="w-4 h-4 shrink-0 mt-0.5" style={{ color: BULLET_BLUE }} />
                            <span className="whitespace-pre-line">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {section.closingParagraphs?.slice(1).map((p, i) => (
                    <p key={i} className="whitespace-pre-line ref-text">
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );

          if (!hasImage) {
            // The intro right under the page title sits close to it, as on the reference.
            const isIntro = idx === 0 && !section.heading;
            return (
              <div key={idx} style={{ backgroundColor: bandBg }} className={isIntro ? '-mt-8 pb-10' : 'py-10'}>
                <div className="max-w-6xl mx-auto px-[10px] sm:px-6 lg:px-8">{textBlock}</div>
                {galleryBlock && <div className="max-w-6xl mx-auto px-[10px] sm:px-6 lg:px-8">{galleryBlock}</div>}
              </div>
            );
          }

          return (
            <div key={idx} style={{ backgroundColor: bandBg }} className="py-10">
              <div
                className={`max-w-6xl mx-auto px-[10px] sm:px-6 lg:px-8 grid grid-cols-1 gap-10 items-center ${
                  isImageLeft ? 'md:grid-cols-[0.85fr_1.15fr]' : 'md:grid-cols-[1.15fr_0.85fr]'
                }`}
              >
                <div className={isImageLeft ? 'order-1' : 'order-1 md:order-2'}>
                  <div className="aspect-3/2 bg-slate-900">
                    <img src={section.image} alt={section.heading || content.title} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className={isImageLeft ? 'order-2' : 'order-2 md:order-1'}>{textBlock}</div>
              </div>
              {galleryBlock && <div className="max-w-6xl mx-auto px-[10px] sm:px-6 lg:px-8">{galleryBlock}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
