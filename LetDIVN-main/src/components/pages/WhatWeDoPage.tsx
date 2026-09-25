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
        wrapperClassName="w-full aspect-21/9 sm:h-[300px] sm:aspect-auto bg-slate-900"
        className="w-full h-full object-cover"
      />

      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

        {/* Header Title & Mission statement */}
        <div className="text-center max-w-6xl mx-auto space-y-3">
          <EditableText
            contentKey="whatWeDo.title"
            defaultValue="WHAT WE DO"
            as="h1"
            className="ref-heading text-3xl sm:text-4xl lg:text-[45px]"
            render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
          />

          <EditableText
            contentKey="whatWeDo.missionSubtitle"
            defaultValue="At Let's Do It! Vietnam, we're on a mission to transform our beautiful country into a cleaner, greener haven."
            as="p"
            multiline
            className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed"
          />
          <EditableText
            contentKey="whatWeDo.differenceSubtitle"
            defaultValue="Here's how we make a difference:"
            as="p"
            className="ref-body text-sm sm:text-base text-slate-600"
          />

          {/* Activities are managed in Decap CMS */}
        </div>
      </div>

      {/* Dynamic List of What We Do Activities: alternating image-left / image-right bands */}
      <div>
        {items.map((item, idx) => {
          const isImageLeft = item.layout !== 'image-right';

          return (
            <div
              key={item.id}
              className={`relative group ${idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}`}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-[0.85fr_1.15fr] gap-10 items-center">

                {/* Photo Column */}
                <div className={isImageLeft ? 'order-1' : 'order-1 md:order-2'}>
                  <div className="aspect-3/2 p-2 bg-white border border-slate-200 shadow-lg rounded-sm">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                </div>

                {/* Text Column */}
                <div className={`space-y-3 ${isImageLeft ? 'order-2' : 'order-2 md:order-1'}`}>
                  <h2 className="ref-heading text-xl sm:text-2xl" style={{ color: BRAND_PINK }}>
                    {item.title}
                  </h2>
                  <div className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed">
                    <p className="whitespace-pre-line text-justify">{item.desc}</p>
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
