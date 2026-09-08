import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';
import { TiltCard } from './TiltCard';

interface AboutSectionProps {
  onLearnMore?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onLearnMore }) => {
  const { t } = useLanguage();
  const [aboutTitleBefore, aboutTitleAfter] = t.aboutTitle.split("Let's do it! Vietnam");

  return (
    <section className="py-10 sm:py-14 relative z-10 border-b border-slate-200/50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: About description */}
          <div className="lg:col-span-5 space-y-4">
            <EditableText
              contentKey="about.title"
              defaultValue={t.aboutTitle || "Phong Trào Let's do it! Vietnam"}
              as="h2"
              className="text-2xl sm:text-3xl lg:text-4xl font-black metallic-title tracking-tight leading-tight"
            />

            <EditableText
              contentKey="about.p1"
              defaultValue={t.aboutP1}
              as="p"
              multiline
              className="text-sm sm:text-base text-slate-600 leading-relaxed"
            />

            <EditableText
              contentKey="about.p2"
              defaultValue={t.aboutP2}
              as="p"
              multiline
              className="text-xs sm:text-sm text-slate-500 leading-relaxed"
            />
          </div>

          {/* Right Column: 2 Full-Bleed 3D Tilt Image Stat Cards */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

              {/* Card 2: 1 Million+ Tình Nguyện Viên Tham Gia */}
              <TiltCard className="border border-white/60 bg-slate-950 h-[320px] sm:h-[360px] flex flex-col justify-end p-6 group">
                <EditableImage
                  contentKey="about.stat2.img"
                  defaultValue="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&auto=format&fit=crop&q=80"
                  alt="Tình Nguyện Viên Tham Gia"
                  wrapperClassName="absolute inset-0 w-full h-full"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                />
                
                {/* Soft subtle bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent pointer-events-none"></div>

                {/* Bottom Content */}
                <div className="relative z-10 text-left space-y-1.5">
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md leading-none">
                    <EditableText
                      contentKey="about.stat2.number"
                      defaultValue="1 Million+"
                      as="span"
                      className="text-white"
                    />
                  </div>
                  <div className="text-sm sm:text-base font-bold text-purple-300 drop-shadow-md leading-snug">
                    <EditableText
                      contentKey="about.stat2.title"
                      defaultValue={t.statVolunteers}
                      as="div"
                    />
                  </div>
                  <div className="text-xs text-slate-200/90 leading-relaxed drop-shadow-md">
                    <EditableText
                      contentKey="about.stat2.sub"
                      defaultValue={t.statVolunteersSub}
                      as="div"
                    />
                  </div>
                </div>
              </TiltCard>

              {/* Card 3: 100+ Chiến Dịch Đã Tổ Chức */}
              <TiltCard className="border border-white/60 bg-slate-950 h-[320px] sm:h-[360px] flex flex-col justify-end p-6 group">
                <EditableImage
                  contentKey="about.stat3.img"
                  defaultValue="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=90"
                  alt="Chiến Dịch Đã Tổ Chức"
                  wrapperClassName="absolute inset-0 w-full h-full"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                />
                
                {/* Soft subtle bottom gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent pointer-events-none"></div>

                {/* Bottom Content */}
                <div className="relative z-10 text-left space-y-1.5">
                  <div className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md leading-none">
                    <EditableText
                      contentKey="about.stat3.number"
                      defaultValue="100+"
                      as="span"
                      className="text-white"
                    />
                  </div>
                  <div className="text-sm sm:text-base font-bold text-amber-300 drop-shadow-md leading-snug">
                    <EditableText
                      contentKey="about.stat3.title"
                      defaultValue={t.statEvents}
                      as="div"
                    />
                  </div>
                  <div className="text-xs text-slate-200/90 leading-relaxed drop-shadow-md">
                    <EditableText
                      contentKey="about.stat3.sub"
                      defaultValue={t.statEventsSub}
                      as="div"
                    />
                  </div>
                </div>
              </TiltCard>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};



