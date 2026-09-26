import React from 'react';
import { UserPlus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';

interface HeroSectionProps {
  onJoinEvent: () => void;
  onExploreProjects: () => void;
  onExploreMap?: () => void;
}

// Matches the letsdoitvietnam.org homepage: a full-width photo with nothing
// laid over it, followed by the "EST. 2015" line and the volunteer sign-up.
export const HeroSection: React.FC<HeroSectionProps> = ({ onJoinEvent }) => {
  const { t } = useLanguage();

  return (
    <div className="relative w-full bg-white select-none">
      <EditableImage
        contentKey="hero.slide1.bgImage"
        defaultValue="/images/hero/wcd-2025-hanoi.jpg"
        alt="World Cleanup Day 2025 in Hanoi"
        wrapperClassName="w-full aspect-[2560/1231] sm:aspect-auto sm:h-[570px] overflow-hidden"
        className="w-full h-full object-cover object-center"
      />

      <div className="pt-10 sm:pt-14 text-center space-y-5">
        <EditableText
          contentKey="hero.slide1.est"
          defaultValue="EST. 2015"
          as="div"
          className="text-lg sm:text-xl font-semibold tracking-wide text-slate-500 uppercase"
        />
        <button
          id="hero-volunteer-btn"
          onClick={onJoinEvent}
          className="btn-pill-3d inline-flex items-center gap-2 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-sm sm:text-base px-8 py-3 shadow-lg cursor-pointer"
        >
          <UserPlus className="w-5 h-5" />
          <span>{t.cardVolBtn}</span>
        </button>
      </div>
    </div>
  );
};
