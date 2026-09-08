import React from 'react';
import { UserPlus, Building2, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { TiltCard } from './TiltCard';
import { GrowingTree } from './GrowingTree';
import { EditableText } from './EditableText';

interface GetInvolvedSectionProps {
  onRegisterVolunteer?: () => void;
  onJoinVolunteer?: () => void;
  onBecomePartner: () => void;
}

export const GetInvolvedSection: React.FC<GetInvolvedSectionProps> = ({
  onRegisterVolunteer,
  onJoinVolunteer,
  onBecomePartner,
}) => {
  const handleVolunteer = onRegisterVolunteer || onJoinVolunteer || (() => {});
  const { t } = useLanguage();

  return (
    <section className="py-10 sm:py-14 relative z-10 border-b border-slate-200/50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="flex justify-center">
            <GrowingTree size={48} variant="emerald" />
          </div>
          <EditableText
            contentKey="getInvolved.title"
            defaultValue={t.getInvolvedTitle || 'Cùng Chung Tay Hành Động'}
            as="h2"
            className="text-2xl sm:text-3xl lg:text-4xl font-black metallic-title tracking-tight leading-tight"
          />
          <EditableText
            contentKey="getInvolved.subtitle"
            defaultValue={t.getInvolvedSubtitle}
            as="p"
            className="text-xs sm:text-sm text-slate-600 leading-relaxed"
          />
        </div>

        {/* 2 Action Columns with 3D Tilt Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 max-w-3xl mx-auto">
          
          {/* Card 1: Register to Volunteer */}
          <TiltCard className="p-6 sm:p-8 border border-white/80 shadow-lg flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-500/20 to-purple-500/10 border border-pink-500/30 flex items-center justify-center text-[#E81A7F] mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xs">
              <UserPlus className="w-7 h-7" />
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
              {t.cardVolTitle}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mb-6 flex-grow leading-relaxed">
              {t.cardVolDesc}
            </p>

            <button
              id="get-involved-volunteer-btn"
              onClick={handleVolunteer}
              className="btn-pill-3d w-full sm:w-auto bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs sm:text-sm px-8 py-3 shadow-lg cursor-pointer"
            >
              {t.cardVolBtn}
            </button>
          </TiltCard>

          {/* Card 2: Become a Partner */}
          <TiltCard className="p-6 sm:p-8 border border-white/80 shadow-lg flex flex-col items-center text-center group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-cyan-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 mb-5 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg sm:text-xl font-black text-slate-900 mb-2">
              {t.cardPartnerTitle}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 mb-6 flex-grow leading-relaxed">
              {t.cardPartnerDesc}
            </p>

            <button
              id="get-involved-partner-btn"
              onClick={onBecomePartner}
              className="btn-pill-3d w-full sm:w-auto bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs sm:text-sm px-8 py-3 shadow-lg cursor-pointer"
            >
              {t.cardPartnerBtn}
            </button>
          </TiltCard>

        </div>



      </div>
    </section>
  );
};


