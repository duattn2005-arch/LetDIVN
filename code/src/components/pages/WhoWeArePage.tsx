import React from 'react';
import { Target, Award, Users, Globe2, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';

export const WhoWeArePage: React.FC<{ onJoin: () => void }> = ({ onJoin }) => {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">

        {/* Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <EditableText
            contentKey="whoWeAre.title"
            defaultValue={`${t.whoWeAreTitlePrefix || 'Chúng Tôi Là'} Let's do it! Vietnam`}
            as="h1"
            className="text-3xl sm:text-4xl lg:text-5xl font-black metallic-title tracking-tight leading-tight [text-wrap:balance]"
          />
          <EditableText
            contentKey="whoWeAre.intro"
            defaultValue={t.whoWeAreIntro}
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]"
          />
          {isAdmin && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-xs font-bold text-purple-700">
              <ShieldCheck className="w-4 h-4" />
              <span>Di chuột vào ảnh/chữ để chỉnh sửa (Admin)</span>
            </div>
          )}
        </div>

        {/* Big Banner Photo */}
        <EditableImage
          contentKey="whoWeAre.bannerImage"
          defaultValue="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=2000&auto=format&fit=crop&q=90"
          alt="Let's do it Vietnam Volunteer Group"
          wrapperClassName="rounded-3xl overflow-hidden shadow-2xl border border-slate-100 aspect-21/9 bg-slate-900"
          className="w-full h-full object-cover"
        />

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 flex items-center justify-center text-[#E81A7F]">
              <Target className="w-6 h-6" />
            </div>
            <EditableText contentKey="whoWeAre.missionTitle" defaultValue={t.whoWeAreMissionTitle} as="h3" className="text-2xl font-bold text-slate-900" />
            <EditableText
              contentKey="whoWeAre.mission"
              defaultValue={t.whoWeAreMissionDesc}
              as="p"
              multiline
              className="text-slate-600 text-sm leading-relaxed"
            />
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Globe2 className="w-6 h-6" />
            </div>
            <EditableText contentKey="whoWeAre.visionTitle" defaultValue={t.whoWeAreVisionTitle} as="h3" className="text-2xl font-bold text-slate-900" />
            <EditableText
              contentKey="whoWeAre.vision"
              defaultValue={t.whoWeAreVisionDesc}
              as="p"
              multiline
              className="text-slate-600 text-sm leading-relaxed"
            />
          </div>
        </div>

        {/* Core Values */}
        <div className="space-y-6 text-center">
          <EditableText contentKey="whoWeAre.valuesTitle" defaultValue={t.whoWeAreValuesTitle} as="h2" className="text-3xl font-extrabold metallic-title text-center" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <CheckCircle2 className="w-6 h-6 text-[#E81A7F]" />
              <EditableText contentKey="whoWeAre.value1Title" defaultValue={t.whoWeAreVal1Title} as="h4" className="font-bold text-base text-slate-900" />
              <EditableText
                contentKey="whoWeAre.value1Desc"
                defaultValue={t.whoWeAreVal1Desc}
                as="p"
                multiline
                className="text-xs text-slate-500 leading-relaxed"
              />
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              <EditableText contentKey="whoWeAre.value2Title" defaultValue={t.whoWeAreVal2Title} as="h4" className="font-bold text-base text-slate-900" />
              <EditableText
                contentKey="whoWeAre.value2Desc"
                defaultValue={t.whoWeAreVal2Desc}
                as="p"
                multiline
                className="text-xs text-slate-500 leading-relaxed"
              />
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
              <EditableText contentKey="whoWeAre.value3Title" defaultValue={t.whoWeAreVal3Title} as="h4" className="font-bold text-base text-slate-900" />
              <EditableText
                contentKey="whoWeAre.value3Desc"
                defaultValue={t.whoWeAreVal3Desc}
                as="p"
                multiline
                className="text-xs text-slate-500 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-slate-900 text-white rounded-3xl p-10 text-center space-y-6">
          <EditableText contentKey="whoWeAre.ctaTitle" defaultValue={t.whoWeAreCtaTitle} as="h3" className="text-3xl font-black" />
          <EditableText
            contentKey="whoWeAre.ctaDesc"
            defaultValue={t.whoWeAreCtaDesc}
            as="p"
            multiline
            className="text-slate-300 max-w-xl mx-auto text-sm"
          />
          <button
            onClick={onJoin}
            className="bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-sm px-8 py-3.5 rounded-full shadow-lg transition-all cursor-pointer"
          >
            <EditableText contentKey="whoWeAre.ctaBtn" defaultValue={t.registerNowBtn} as="span" />
          </button>
        </div>

      </div>
    </div>
  );
};


