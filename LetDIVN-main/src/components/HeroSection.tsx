import React from 'react';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';

interface HeroSectionProps {
  onJoinEvent: () => void;
  onExploreProjects: () => void;
  onExploreMap?: () => void;
}

// Matches the letsdoitvietnam.org homepage: a full-width photo with nothing
// laid over it, followed by the "EST. 2015" line.
export const HeroSection: React.FC<HeroSectionProps> = () => {
  return (
    <div className="relative w-full bg-white select-none">
      <EditableImage
        contentKey="hero.slide1.bgImage"
        defaultValue="/images/hero/wcd-2025-hanoi.jpg"
        alt="World Cleanup Day 2025 in Hanoi"
        wrapperClassName="w-full aspect-[2560/1231] max-h-[80vh] overflow-hidden"
        className="w-full h-full object-cover object-center"
      />

      <div className="pt-10 sm:pt-14 text-center">
        <EditableText
          contentKey="hero.slide1.est"
          defaultValue="EST. 2015"
          as="div"
          className="text-lg sm:text-xl font-semibold tracking-wide text-slate-500 uppercase"
        />
      </div>
    </div>
  );
};
