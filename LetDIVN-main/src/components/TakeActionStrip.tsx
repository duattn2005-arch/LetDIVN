import React from 'react';
import { BookOpen, Brush, Leaf, Users, type LucideIcon } from 'lucide-react';
import { EditableImage } from './EditableImage';
import { EditableText } from './EditableText';

// The four coloured tiles (colours, sizes and fonts measured on the reference site).
const cards: { key: string; title: string; desc: string; bg: string; Icon: LucideIcon }[] = [
  { key: 'card1', title: 'World Cleanup Day', desc: 'Create a positive impact on the environment by mobilizing millions of volunteers in Vietnam.', bg: '#515870', Icon: Brush },
  { key: 'card2', title: 'Environmental Awareness', desc: 'Empower individuals to make informed choices and take action for a greener planet', bg: '#576F9E', Icon: BookOpen },
  { key: 'card3', title: 'Community Engagement', desc: 'Drive meaningful change and inspire others to join the cause.', bg: '#2F658C', Icon: Users },
  { key: 'card4', title: 'Sustainable Lifestyle', desc: 'Emphasizing responsible consumption, waste reduction, and eco-friendly choices', bg: '#6B6B6B', Icon: Leaf },
];

/**
 * The "photo strip + four coloured tiles" block at the bottom of most interior
 * pages on the reference site (letsdoitvietnam.org). Project pages show the
 * tiles only (`photos={false}`), as the reference does.
 */
export const TakeActionStrip: React.FC<{ contentKeyPrefix: string; photos?: boolean }> = ({ contentKeyPrefix, photos = true }) => {
  return (
    <div>
      {photos && (
        <div className="grid grid-cols-1 sm:grid-cols-[1.8fr_1fr]">
          <EditableImage
            contentKey={`${contentKeyPrefix}.stripImage1`}
            defaultValue="/images/what-we-do/strip1.jpg"
            alt="Let's Do It Vietnam volunteers"
            wrapperClassName="aspect-video sm:aspect-auto sm:h-[445px] bg-slate-900"
            className="w-full h-full object-cover object-bottom"
          />
          <EditableImage
            contentKey={`${contentKeyPrefix}.stripImage2`}
            defaultValue="/images/what-we-do/strip2.jpg"
            alt="Let's Do It Vietnam volunteers"
            wrapperClassName="aspect-video sm:aspect-auto sm:h-[445px] bg-slate-900"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ key, title, desc, bg, Icon }) => (
          <div key={key} className="p-[35px] text-left text-white lg:min-h-[252px]" style={{ backgroundColor: bg, fontFamily: 'Roboto, sans-serif' }}>
            <Icon className="w-[50px] h-[50px] mb-5" strokeWidth={1.75} aria-hidden />
            <EditableText
              contentKey={`${contentKeyPrefix}.${key}Title`}
              defaultValue={title}
              as="h3"
              className="block text-[21px] leading-[21px] font-semibold uppercase pb-2.5"
            />
            <EditableText
              contentKey={`${contentKeyPrefix}.${key}Desc`}
              defaultValue={desc}
              as="p"
              className="text-sm leading-[1.7]"
              multiline
            />
          </div>
        ))}
      </div>
    </div>
  );
};
