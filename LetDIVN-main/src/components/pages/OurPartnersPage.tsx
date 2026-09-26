import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { Partner } from '../../types';
import { Globe } from 'lucide-react';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { TakeActionStrip } from '../TakeActionStrip';

const BRAND_PINK = '#F1138D';

export const OurPartnersPage: React.FC<{ onBecomePartner: () => void }> = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const loadPartners = () => {
    dbService.getPartners().then(setPartners);
  };

  useEffect(() => {
    loadPartners();
    const unsub = dbService.subscribe(loadPartners);
    return () => unsub();
  }, []);

  return (
    <div className="bg-white">

      {/* Full-width hero banner */}
      <EditableImage
        contentKey="ourPartners.heroImage"
        defaultValue="/images/our-partners/hero.jpg"
        alt="Let's Do It Vietnam volunteers"
        wrapperClassName="w-full aspect-21/9 sm:h-[425px] sm:aspect-auto bg-slate-900"
        className="w-full h-full object-cover"
      />

      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        <div className="text-center max-w-6xl mx-auto space-y-3">
          <EditableText
            contentKey="ourPartners.title"
            defaultValue="We Work With the Best Partners"
            as="h1"
            className="ref-heading ref-title-lg"
            render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
          />
          <EditableText
            contentKey="ourPartners.subtitle"
            defaultValue="Working with strong partners can make a significant impact."
            as="p"
            className="ref-text"
          />
          <EditableText
            contentKey="ourPartners.desc"
            defaultValue="We collaborate with local communities, schools, and businesses to organize large-scale clean-up campaigns. We partner with companies to promote sustainable practices within their operations."
            as="p"
            multiline
            className="ref-text"
          />

        </div>

        {/* Clean Modern Logo Showcase Grid with Flowing Rainbow Border & Drag & Drop */}
        {/* Order and per-logo size ("scale") are set in Decap CMS. */}
        <div className="grid gap-6 sm:gap-8 lg:gap-10 items-center justify-items-center py-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {partners.map((p) => {
            const itemScale = p.scale || 100;

            return (
              <div
                key={p.id}
                className="relative group w-full max-w-[240px] h-32 sm:h-36 rainbow-border-card transition-all duration-200"
              >

                {/* Clickable Logo Inner Container */}
                <div className="rainbow-border-inner overflow-hidden">
                  <a
                    href={p.website || '#'}
                    target={p.website ? "_blank" : undefined}
                    rel="noreferrer"
                    title={`${p.name}${p.website ? ` (Click to open ${p.website})` : ''}`}
                    className="w-full h-full flex items-center justify-center p-2 cursor-pointer transition-transform duration-300 group-hover:scale-105"
                  >
                    <img
                      src={p.logo}
                      alt={p.name}
                      style={{
                        transform: `scale(${itemScale / 100})`,
                        transformOrigin: 'center center'
                      }}
                      className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-200"
                      loading="lazy"
                    />
                  </a>
                </div>

                {/* Company Name & Link Hover Badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 whitespace-nowrap bg-slate-900/90 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1.5">
                  <span>{p.name}</span>
                  {p.website && <Globe className="w-3 h-3 text-pink-400" />}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      <TakeActionStrip contentKeyPrefix="ourPartners" />
    </div>
  );
};


