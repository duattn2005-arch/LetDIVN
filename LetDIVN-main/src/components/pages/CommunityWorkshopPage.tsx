import React from 'react';
import { ArrowLeft, Paintbrush, BookOpen, Users, Leaf } from 'lucide-react';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';

interface CommunityWorkshopPageProps {
  onBack: () => void;
}

const GALLERY_KEYS = ['photo1', 'photo2', 'photo3', 'photo4', 'photo5', 'photo6', 'photo7', 'photo8'];

export const CommunityWorkshopPage: React.FC<CommunityWorkshopPageProps> = ({ onBack }) => {
  return (
    <div className="bg-white">
      {/* Full-bleed banner */}
      <div className="w-full aspect-3/1 bg-slate-100 overflow-hidden">
        <EditableImage
          contentKey="workshop.banner"
          defaultValue="/images/community-workshop/banner.jpg"
          alt="Community workshop event setup with eco-friendly gift bags and plants"
          wrapperClassName="w-full h-full"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#E81A7F] transition-colors cursor-pointer mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>

        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <EditableText
            contentKey="workshop.title"
            defaultValue="Community Workshop"
            as="h1"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#E81A7F] tracking-tight leading-tight"
          />
          <EditableText
            contentKey="workshop.intro"
            defaultValue="The Community Workshop is part of a broader initiative aimed at environmental protection and sustainability. These workshops are organized under the umbrella of the global Let's Do It! World movement, which focuses on tackling environmental issues through community-driven efforts."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed"
          />
        </div>

        {/* Photo gallery */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {GALLERY_KEYS.map((k) => (
            <div key={k} className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100">
              <EditableImage
                contentKey={`workshop.${k}`}
                defaultValue={`/images/community-workshop/${k}.jpg`}
                alt="Community workshop activity"
                wrapperClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* 4-column value strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            key: 'pillar1',
            icon: Paintbrush,
            bg: 'bg-slate-700',
            title: 'World Cleanup Day',
            desc: 'Create a positive impact on the environment by mobilizing millions of volunteers in Vietnam.',
          },
          {
            key: 'pillar2',
            icon: BookOpen,
            bg: 'bg-blue-800',
            title: 'Environmental Awareness',
            desc: 'Empower individuals to make informed choices and take action for a greener planet',
          },
          {
            key: 'pillar3',
            icon: Users,
            bg: 'bg-slate-600',
            title: 'Community Engagement',
            desc: 'Drive meaningful change and inspire others to join the cause.',
          },
          {
            key: 'pillar4',
            icon: Leaf,
            bg: 'bg-neutral-700',
            title: 'Sustainable Lifestyle',
            desc: 'Emphasizing responsible consumption, waste reduction, and eco-friendly choices',
          },
        ].map(({ key, icon: Icon, bg, title, desc }) => (
          <div key={key} className={`${bg} text-white p-8 sm:p-10 space-y-3`}>
            <Icon className="w-8 h-8" />
            <EditableText
              contentKey={`workshop.${key}.title`}
              defaultValue={title}
              as="h3"
              className="text-lg font-black uppercase tracking-wide"
            />
            <EditableText
              contentKey={`workshop.${key}.desc`}
              defaultValue={desc}
              as="p"
              multiline
              className="text-xs sm:text-sm text-slate-200 leading-relaxed"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
