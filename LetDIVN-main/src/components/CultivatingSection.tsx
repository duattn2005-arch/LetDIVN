import React from 'react';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';

interface CultivatingSectionProps {
  onNavigate: (view: string) => void;
}

const TILES: { key: string; view: string; label: string; defaultImage: string }[] = [
  {
    key: 'whoWeAre',
    view: 'who-we-are',
    label: 'Who We Are',
    defaultImage: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1000&auto=format&fit=crop&q=80',
  },
  {
    key: 'whatWeDo',
    view: 'what-we-do',
    label: 'What We Do',
    defaultImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80',
  },
  {
    key: 'ourPartners',
    view: 'our-partners',
    label: 'Our Partners',
    defaultImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1000&auto=format&fit=crop&q=80',
  },
  {
    key: 'mediaOnUs',
    view: 'media-on-us',
    label: 'Media on Us',
    defaultImage: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1000&auto=format&fit=crop&q=80',
  },
];

export const CultivatingSection: React.FC<CultivatingSectionProps> = ({ onNavigate }) => {
  return (
    <section className="py-10 sm:py-14 relative z-10 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-slate-400">
            Est. 2015
          </div>
          <EditableText
            contentKey="cultivating.title"
            defaultValue="Cultivating the Beautiful in Vietnam"
            as="h2"
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#E81A7F] tracking-tight"
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {TILES.map((tile) => (
            <button
              key={tile.key}
              type="button"
              onClick={() => onNavigate(tile.view)}
              className="group relative aspect-4/3 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer text-left border border-white/60"
            >
              <EditableImage
                contentKey={`cultivating.${tile.key}.image`}
                defaultValue={tile.defaultImage}
                alt={tile.label}
                wrapperClassName="absolute inset-0 w-full h-full"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">
                <span className="text-white font-bold text-sm sm:text-base drop-shadow-md">
                  {tile.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
