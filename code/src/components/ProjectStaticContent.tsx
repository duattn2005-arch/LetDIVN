import React from 'react';
import { CircleDot, PersonStanding } from 'lucide-react';
import { PROJECT_STATIC_CONTENT } from '../data/projectStaticContent';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';
import { EditableGalleryGrid } from './EditableGalleryGrid';

const BRAND_PINK = '#F1138D';
const BRAND_AMBER = '#FEAC13';
const BAND_GRAY = '#F2F2F2';
const BULLET_BLUE = '#6EC1E4';

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/**
 * Renders the "about this campaign" content mirrored from the matching page
 * on letsdoitvietnam.org, shown above the registration/map section for
 * projects whose category has a matching entry.
 *
 * Typography and layout are matched to the reference site's Elementor/Divi
 * build: "Chau Philomene One" (weight 500) for every heading, "Poppins" for
 * body copy, plain (non-rounded, no shadow) photos, and full-bleed
 * alternating gray/white bands for each image+text section. All text/images
 * are wired through EditableText/EditableImage so admins can edit them.
 */
export const ProjectStaticContent: React.FC<{ category: string }> = ({ category }) => {
  const content = PROJECT_STATIC_CONTENT[category];
  if (!content) return null;

  const titleColor = content.titleColor || BRAND_PINK;
  const keyBase = `project.${slugify(category)}`;
  // Left/right alternation only counts sections that actually have an image —
  // a heading-only or gallery-only section in between (verified against the
  // reference site) doesn't flip the side of the next real image band.
  let imageBandIndex = -1;

  return (
    <div className="bg-white">
      <EditableImage
        contentKey={`${keyBase}.hero`}
        defaultValue={content.hero}
        alt={content.title}
        wrapperClassName="w-full aspect-21/9 sm:h-[420px] sm:aspect-auto bg-slate-900"
        className="w-full h-full object-cover"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-3 text-center">
        {content.kicker && (
          <EditableText
            contentKey={`${keyBase}.kicker`}
            defaultValue={content.kicker}
            as="h3"
            className="block ref-heading text-xl sm:text-2xl"
            render={(v) => <span style={{ color: BRAND_AMBER }}>{v}</span>}
          />
        )}
        <EditableText
          contentKey={`${keyBase}.title`}
          defaultValue={content.title}
          as="h2"
          className="block ref-heading text-3xl sm:text-4xl lg:text-[45px]"
          render={(v) => <span style={{ color: titleColor }}>{v}</span>}
        />
      </div>

      <div>
        {content.sections.map((section, idx) => {
          const hasImage = !!section.image;
          if (hasImage) imageBandIndex++;
          const isImageLeft = imageBandIndex % 2 === 0;
          const isBulletList = section.bulletList ?? (section.paragraphs.length > 2 && section.paragraphs.every((p) => p.length < 160));
          // Reference site centers only the title-adjacent intro blurb (no heading of its own)
          // and any title-style heading section — UNLESS the paragraph sits in an image+text
          // band, which is always left-aligned regardless of heading (verified on World Cleanup
          // Day's "Since 2018" and Environmental Day's image bands). Every other body paragraph
          // (under a regular amber sub-heading, e.g. "Background") is left-aligned too.
          const textAlign = hasImage || (section.heading && !section.headingAsTitle) ? 'text-left' : 'text-center';
          const bandBg = section.band ? (section.band === 'gray' ? BAND_GRAY : 'transparent') : idx % 2 === 0 ? BAND_GRAY : 'transparent';
          const sectionKey = `${keyBase}.section${idx}`;

          const galleryBlock = section.gallery && section.gallery.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-6">
              <EditableGalleryGrid
                contentKey={`${sectionKey}.gallery`}
                defaultImages={section.gallery}
                alt={section.heading || content.title}
                cellClassName="aspect-square"
              />
            </div>
          );

          // Two side-by-side sub-columns (e.g. "Main activities" | "Direct target audience")
          if (section.columns && section.columns.length > 0) {
            return (
              <div key={idx} style={{ backgroundColor: bandBg }} className="py-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                  {section.heading && (
                    <EditableText
                      contentKey={`${sectionKey}.heading`}
                      defaultValue={section.heading}
                      as="h3"
                      className="block ref-heading text-xl sm:text-2xl text-left"
                      render={(v) => <span style={{ color: BRAND_AMBER }}>{v}</span>}
                    />
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {section.columns.map((col, ci) => (
                      <div key={ci} className="space-y-2">
                        {col.heading && (
                          <EditableText
                            contentKey={`${sectionKey}.col${ci}.heading`}
                            defaultValue={col.heading}
                            as="h4"
                            className="ref-body font-semibold text-slate-800 text-left"
                          />
                        )}
                        <ul className="space-y-1.5 text-left">
                          {col.paragraphs.map((p, pi) => (
                            <li key={pi} className="ref-body text-sm text-slate-600 leading-relaxed flex gap-2">
                              <CircleDot className="w-4 h-4 shrink-0 mt-0.5" style={{ color: BULLET_BLUE }} />
                              <EditableText contentKey={`${sectionKey}.col${ci}.p${pi}`} defaultValue={p} as="span" multiline />
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
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-3">
                  <PersonStanding className="w-6.5 h-6.5 shrink-0" style={{ color: BRAND_PINK }} />
                  <EditableText
                    contentKey={`${sectionKey}.personListItem`}
                    defaultValue={section.personListItem}
                    as="span"
                    className="ref-body text-base"
                    render={(v) => <span style={{ color: '#54595F' }}>{v}</span>}
                  />
                </div>
              </div>
            );
          }

          const textBlock = (
            <div className={`space-y-3 ${textAlign}`}>
              {section.heading && (
                <EditableText
                  contentKey={`${sectionKey}.heading`}
                  defaultValue={section.heading}
                  as="h3"
                  className={
                    section.headingAsTitle
                      ? 'block ref-heading text-3xl sm:text-4xl lg:text-[45px] text-center'
                      : 'block ref-heading text-xl sm:text-2xl text-left'
                  }
                  render={(v) => <span style={{ color: section.headingAsTitle ? titleColor : BRAND_AMBER }}>{v}</span>}
                />
              )}
              {isBulletList ? (
                <ul className="space-y-2 text-left">
                  {section.paragraphs.map((p, i) => (
                    <li key={i} className="ref-body text-sm text-slate-600 leading-relaxed flex gap-2">
                      <CircleDot className="w-4 h-4 shrink-0 mt-0.5" style={{ color: BULLET_BLUE }} />
                      <EditableText contentKey={`${sectionKey}.p${i}`} defaultValue={p} as="span" multiline />
                    </li>
                  ))}
                </ul>
              ) : (
                section.paragraphs.map((p, i) => (
                  <EditableText
                    key={i}
                    contentKey={`${sectionKey}.p${i}`}
                    defaultValue={p}
                    as="p"
                    multiline
                    className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed"
                  />
                ))
              )}

              {section.subBlocks && section.subBlocks.length > 0 && (
                <div className="text-left space-y-8 pt-2">
                  {section.subBlocks.map((block, bi) => (
                    <div key={bi} className="space-y-2">
                      <EditableText
                        contentKey={`${sectionKey}.sub${bi}.title`}
                        defaultValue={block.title}
                        as="p"
                        className="ref-body text-sm sm:text-base font-bold text-slate-700"
                      />
                      <EditableText
                        contentKey={`${sectionKey}.sub${bi}.text`}
                        defaultValue={block.text}
                        as="p"
                        multiline
                        className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed"
                      />
                      {block.gallery && block.gallery.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                          <EditableGalleryGrid
                            contentKey={`${sectionKey}.sub${bi}.gallery`}
                            defaultImages={block.gallery}
                            alt={block.title}
                            cellClassName="aspect-3/2"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {(section.closingParagraphs?.length || section.closingBullets?.length) && (
                <div className="text-left space-y-3 pt-2">
                  {section.closingParagraphs?.[0] && (
                    <EditableText
                      contentKey={`${sectionKey}.closing.p0`}
                      defaultValue={section.closingParagraphs[0]}
                      as="p"
                      multiline
                      className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed"
                    />
                  )}
                  {section.closingBullets && section.closingBullets.length > 0 && (
                    <>
                      {section.closingBulletsLabel && (
                        <EditableText
                          contentKey={`${sectionKey}.closing.bulletsLabel`}
                          defaultValue={section.closingBulletsLabel}
                          as="p"
                          className="ref-body text-sm sm:text-base font-bold text-slate-700"
                        />
                      )}
                      <ul className="space-y-1.5">
                        {section.closingBullets.map((p, i) => (
                          <li key={i} className="ref-body text-sm text-slate-600 leading-relaxed flex gap-2">
                            <CircleDot className="w-4 h-4 shrink-0 mt-0.5" style={{ color: BULLET_BLUE }} />
                            <EditableText contentKey={`${sectionKey}.closing.bullet${i}`} defaultValue={p} as="span" multiline />
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {section.closingParagraphs?.slice(1).map((p, i) => (
                    <EditableText
                      key={i}
                      contentKey={`${sectionKey}.closing.p${i + 1}`}
                      defaultValue={p}
                      as="p"
                      multiline
                      className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed"
                    />
                  ))}
                </div>
              )}
            </div>
          );

          if (!hasImage) {
            return (
              <div key={idx} style={{ backgroundColor: bandBg }} className="py-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{textBlock}</div>
                {galleryBlock && <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{galleryBlock}</div>}
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
                  <EditableImage
                    contentKey={`${sectionKey}.image`}
                    defaultValue={section.image!}
                    alt={section.heading || content.title}
                    wrapperClassName="aspect-3/2 bg-slate-900"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={isImageLeft ? 'order-2' : 'order-2 md:order-1'}>{textBlock}</div>
              </div>
              {galleryBlock && <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">{galleryBlock}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};
