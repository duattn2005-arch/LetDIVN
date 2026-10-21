import React from 'react';
import { EditableImage } from './EditableImage';

interface HeroSectionProps {
  onJoinEvent: () => void;
  onExploreMap?: () => void;
}

// Matches the letsdoitvietnam.org homepage: a full-width photo with nothing
// laid over it (the "EST. 2015" line follows in HomeQuickLinksSection).
export const HeroSection: React.FC<HeroSectionProps> = () => {
  return (
    <div className="relative w-full bg-white select-none">
      <EditableImage
        contentKey="hero.slide1.bgImage"
        defaultValue="/images/hero/wcd-2025-hanoi.jpg"
        alt="World Cleanup Day 2025 in Hanoi"
        wrapperClassName="w-full aspect-[2560/1231] sm:aspect-auto sm:h-[570px] overflow-hidden"
        className="w-full h-full object-cover object-center"
      />

    </div>
  );
};
