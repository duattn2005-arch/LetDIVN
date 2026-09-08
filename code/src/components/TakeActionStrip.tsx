import React from 'react';
import { EditableImage } from './EditableImage';
import { EditableText } from './EditableText';

const BRAND_PINK = '#F1138D';

const cards = [
  { key: 'card1', title: 'World Cleanup Day', desc: 'Create a positive impact on the environment by mobilizing millions of volunteers in Vietnam.' },
  { key: 'card2', title: 'Environmental Awareness', desc: 'Empower individuals to make informed choices and take action for a greener planet' },
  { key: 'card3', title: 'Community Engagement', desc: 'Drive meaningful change and inspire others to join the cause.' },
  { key: 'card4', title: 'Sustainable Lifestyle', desc: 'Emphasizing responsible consumption, waste reduction, and eco-friendly choices' },
];

/**
 * The "4 taglines over a photo strip" block reused near the bottom of most
 * interior pages on the reference site (letsdoitvietnam.org).
 */
export const TakeActionStrip: React.FC<{ contentKeyPrefix: string }> = ({ contentKeyPrefix }) => {
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <EditableImage
          contentKey={`${contentKeyPrefix}.stripImage1`}
          defaultValue="/images/what-we-do/strip1.jpg"
          alt="Let's Do It Vietnam volunteers"
          wrapperClassName="aspect-video sm:aspect-auto sm:h-[280px] bg-slate-900"
          className="w-full h-full object-cover object-bottom"
        />
        <EditableImage
          contentKey={`${contentKeyPrefix}.stripImage2`}
          defaultValue="/images/what-we-do/strip2.jpg"
          alt="Let's Do It Vietnam volunteers"
          wrapperClassName="aspect-video sm:aspect-auto sm:h-[280px] bg-slate-900"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {cards.map((card) => (
          <div key={card.key} className="space-y-1.5">
            <EditableText
              contentKey={`${contentKeyPrefix}.${card.key}Title`}
              defaultValue={card.title}
              as="h4"
              className="ref-heading text-sm uppercase tracking-wide"
              render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
            />
            <EditableText
              contentKey={`${contentKeyPrefix}.${card.key}Desc`}
              defaultValue={card.desc}
              as="p"
              className="ref-body text-xs text-slate-500 leading-relaxed"
              multiline
            />
          </div>
        ))}
      </div>
    </div>
  );
};
