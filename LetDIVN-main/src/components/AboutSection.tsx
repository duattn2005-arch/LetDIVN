import React from 'react';
import { Leaf, Trees, UserCheck, ArrowUpRight } from 'lucide-react';
import { EditableText } from './EditableText';

interface AboutSectionProps {
  onLearnMore?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onLearnMore }) => {
  return (
    <section className="py-10 sm:py-14 relative z-10 border-b border-slate-200/50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">

        {/* WHO WE ARE Header & Intro */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <EditableText
            contentKey="whoWeAre.mainTitle"
            defaultValue="WHO WE ARE"
            as="h2"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#E81A7F] tracking-tight uppercase"
          />
          <EditableText
            contentKey="whoWeAre.mainIntro"
            defaultValue="We’re a diverse group of people, all bound together by something even bigger than collecting trash: working together to engage the Vietnam communities and share our passion for the beauty of the natural world."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto"
          />
        </div>

        {/* 3 Core Values (Clean, Natural, Authentic) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-5xl mx-auto text-center">
          {/* Clean */}
          <div className="space-y-3 px-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-[#E81A7F] shadow-xs">
              <Leaf className="w-6 h-6" />
            </div>
            <EditableText
              contentKey="whoWeAre.valCleanTitle"
              defaultValue="Clean"
              as="h3"
              className="text-lg sm:text-xl font-bold text-slate-900"
            />
            <EditableText
              contentKey="whoWeAre.valCleanDesc"
              defaultValue="We take pride in engaging with beauty and its power to ignite inspiration."
              as="p"
              multiline
              className="text-xs sm:text-sm text-slate-600 leading-relaxed"
            />
          </div>

          {/* Natural */}
          <div className="space-y-3 px-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-[#E81A7F] shadow-xs">
              <Trees className="w-6 h-6" />
            </div>
            <EditableText
              contentKey="whoWeAre.valNaturalTitle"
              defaultValue="Natural"
              as="h3"
              className="text-lg sm:text-xl font-bold text-slate-900"
            />
            <EditableText
              contentKey="whoWeAre.valNaturalDesc"
              defaultValue="We draw inspiration from the unparalleled beauty of the natural world and promote its integration into our constructed surroundings."
              as="p"
              multiline
              className="text-xs sm:text-sm text-slate-600 leading-relaxed"
            />
          </div>

          {/* Authentic */}
          <div className="space-y-3 px-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center text-[#E81A7F] shadow-xs">
              <UserCheck className="w-6 h-6" />
            </div>
            <EditableText
              contentKey="whoWeAre.valAuthenticTitle"
              defaultValue="Authentic"
              as="h3"
              className="text-lg sm:text-xl font-bold text-slate-900"
            />
            <EditableText
              contentKey="whoWeAre.valAuthenticDesc"
              defaultValue="Embracing our identity, we proudly showcase our passion as a local, ethical, imperfect, and authentic entity."
              as="p"
              multiline
              className="text-xs sm:text-sm text-slate-600 leading-relaxed"
            />
          </div>
        </div>

        {/* Promoting Sustainability and Community Action */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <EditableText
            contentKey="whoWeAre.section2Title"
            defaultValue="Promoting Sustainability and Community Action"
            as="h2"
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#E81A7F] tracking-tight"
          />
          <EditableText
            contentKey="whoWeAre.section2Desc"
            defaultValue="Let’s Do It Vietnam is a vibrant and dedicated organization committed to environmental sustainability and community action. As part of the global Let’s Do It World movement, we focus on addressing waste management issues, promoting recycling, and fostering a cleaner, greener Vietnam. Our activities range from large-scale cleanup events to educational campaigns, engaging volunteers and communities across the country."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-4xl mx-auto"
          />

          {onLearnMore && (
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={onLearnMore}
                className="bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <span>Learn More</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
