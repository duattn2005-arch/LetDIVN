import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { WhatWeDoItem } from '../../types';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { TakeActionStrip } from '../TakeActionStrip';

const BRAND_PINK = '#F1138D';

export const WhatWeDoPage: React.FC<{ onExploreProjects: () => void }> = () => {
  const [items, setItems] = useState<WhatWeDoItem[]>([]);

  useEffect(() => {
    const refresh = () => { dbService.getWhatWeDo().then(setItems); };
    refresh();
    const unsub = dbService.subscribe(refresh);
    return unsub;
  }, []);

  return (
    <div className="bg-white select-none min-h-screen">

      {/* Full-width hero banner */}
      <EditableImage
        contentKey="whatWeDo.heroImage"
        defaultValue="/images/what-we-do/hero.jpg"
        alt="Collected recyclable waste"
        wrapperClassName="w-full aspect-21/9 sm:h-[484px] sm:aspect-auto bg-slate-900"
        className="w-full h-full object-cover"
      />

      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Header Title & Mission statement */}
        <div className="text-center max-w-6xl mx-auto space-y-3">
          <EditableText
            contentKey="whatWeDo.title"
            defaultValue="WHAT WE DO"
            as="h1"
            className="ref-heading ref-title-xl"
            render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
          />

          <EditableText
            contentKey="whatWeDo.missionSubtitle"
            defaultValue="At Let's Do It! Vietnam, we're on a mission to transform our beautiful country into a cleaner, greener haven."
            as="p"
            multiline
            className="ref-text max-w-[878px] mx-auto"
          />
          <EditableText
            contentKey="whatWeDo.differenceSubtitle"
            defaultValue="Here's how we make a difference:"
            as="p"
            className="ref-text"
          />

          {/* Activities are managed in Decap CMS */}
        </div>
      </div>

      {/* Dynamic List of What We Do Activities: alternating image-left / image-right bands */}
      <div>
        {items.map((item, idx) => {
          const isImageLeft = item.layout !== 'image-right';

          return (
            // As on the reference: grey band first, then white, alternating; plain
            // photos (526px left / 550px right) in a 1140px row.
            <div key={item.id} className={`relative group ${idx % 2 === 0 ? 'bg-[#F2F2F2]' : 'bg-white'}`}>
              <div
                className={`max-w-[1140px] mx-auto px-4 xl:px-0 py-5 grid grid-cols-1 gap-x-[14px] gap-y-6 items-center ${
                  isImageLeft ? 'md:grid-cols-2 lg:grid-cols-[526px_1fr]' : 'md:grid-cols-2 lg:grid-cols-[1fr_550px]'
                }`}
              >

                {/* Photo Column */}
                <div className={isImageLeft ? 'order-1' : 'order-1 md:order-2'}>
                  <div className={isImageLeft ? 'aspect-3/2' : 'aspect-[550/410]'}>
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Text Column */}
                <div className={`space-y-3 ${isImageLeft ? 'order-2' : 'order-2 md:order-1'}`}>
                  <h2 className="ref-heading ref-title-md" style={{ color: BRAND_PINK }}>
                    {item.title}
                  </h2>
                  <div className="ref-text max-w-[550px]">
                    <p className="whitespace-pre-line">{item.desc}</p>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      <TakeActionStrip contentKeyPrefix="whatWeDo" />
    </div>
  );
};
