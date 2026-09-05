import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';

interface WorldCleanupDayPageProps {
  onBack: () => void;
}

export const WorldCleanupDayPage: React.FC<WorldCleanupDayPageProps> = ({ onBack }) => {
  return (
    <div className="bg-white">
      {/* Hero banner: full-bleed, no rounding/border/shadow/overlay text */}
      <div className="w-full aspect-3/1 bg-slate-100 overflow-hidden">
        <EditableImage
          contentKey="wcd.banner"
          defaultValue="/images/world-cleanup-day/banner.jpg"
          alt="A volunteer holding up litter pickers in a peace sign, surrounded by other masked volunteers"
          wrapperClassName="w-full h-full"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#e91e63] transition-colors cursor-pointer mb-8 max-w-[1100px] mx-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        {/* Title & intro, centered */}
        <div className="text-center max-w-[800px] mx-auto space-y-4 mb-14">
          <EditableText
            contentKey="wcd.title"
            defaultValue="20 September – World Cleanup Day"
            as="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#e91e63] tracking-tight leading-tight"
          />
          <EditableText
            contentKey="wcd.intro"
            defaultValue="World Cleanup Day has now been added to the official United Nations Calendar of International Days & Weeks from 2024 onwards! This presents even greater opportunities to unite tens of millions participants in cross-sector cooperation, bringing citizens, governments, and organisations together to tackle the global mismanaged waste crisis and to help create a new, more sustainable and waste-free world. Join us on 20 September this year and every year!"
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed"
          />
        </div>

        {/* Zig-zag content, pure white background */}
        <div className="max-w-[1100px] mx-auto">
          {/* Block 1: image left, text right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-14">
            <div className="aspect-4/3 bg-slate-100">
              <EditableImage
                contentKey="wcd.block1.image"
                defaultValue="/images/world-cleanup-day/block1-since2018.jpg"
                alt="Volunteer sorting collected waste"
                wrapperClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
            <EditableText
              contentKey="wcd.block1.text"
              defaultValue="Since 2018, World Cleanup Day has become the biggest civic movement in human history, uniting 211 countries and territories – which includes 95% of UN-listed countries – across the world, and 91 million volunteers, equal to 1.1% of global population – all striving to create a cleaner planet."
              as="p"
              multiline
              className="text-sm sm:text-base text-slate-600 leading-relaxed"
            />
          </div>

          {/* Block 2 (reversed): text left, image right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-14">
            <div className="space-y-4 order-2 lg:order-1">
              <EditableText
                contentKey="wcd.block2.text1"
                defaultValue="World Cleanup Day harnesses the power of people around the world to achieve incredible things by joining together."
                as="p"
                multiline
                className="text-sm sm:text-base text-slate-600 leading-relaxed"
              />
              <EditableText
                contentKey="wcd.block2.text2"
                defaultValue="Its beauty lies in cooperation and collaboration: building bridges between otherwise disparate communities – and including all levels and sectors of society – from citizens to businesses, to governments."
                as="p"
                multiline
                className="text-sm sm:text-base text-slate-600 leading-relaxed"
              />
            </div>
            <div className="aspect-4/3 bg-slate-100 order-1 lg:order-2">
              <EditableImage
                contentKey="wcd.block2.image"
                defaultValue="/images/world-cleanup-day/block2-cooperation.jpg"
                alt="Volunteers reviewing cleanup plans together"
                wrapperClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Center: From Now and Forever */}
          <div className="text-center max-w-[800px] mx-auto space-y-4 mb-14">
            <EditableText
              contentKey="wcd.fromNowTitle"
              defaultValue="From Now and Forever"
              as="h2"
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#e91e63] tracking-tight"
            />
            <EditableText
              contentKey="wcd.fromNowText1"
              defaultValue="This year's event takes place on Friday 20 September following our addition to the UN Calendar of International Days!"
              as="p"
              multiline
              className="text-sm sm:text-base text-slate-600 leading-relaxed"
            />
            <EditableText
              contentKey="wcd.fromNowText2"
              defaultValue="We aim to activate 5% of the world's population that will catalyse lasting societal change in behaviour around mismanaged waste"
              as="p"
              multiline
              className="text-sm sm:text-base text-slate-600 leading-relaxed"
            />
          </div>

          {/* Block 3: image left, text right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-14">
            <div className="aspect-4/3 bg-slate-100">
              <EditableImage
                contentKey="wcd.block3.image"
                defaultValue="/images/world-cleanup-day/block3-global-movement.jpg"
                alt="A large crowd of volunteers gathered together"
                wrapperClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
            <EditableText
              contentKey="wcd.block3.text"
              defaultValue="World Cleanup Day has since grown into a global movement across almost every nation and territory on the planet, with millions of volunteers and a strong network of charismatic leaders. The simple act of cleaning has become a force that binds together people and groups that would otherwise never dream of working towards the same goal."
              as="p"
              multiline
              className="text-sm sm:text-base text-slate-600 leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
