import React from 'react';
import { Paintbrush, BookOpen, Users, Leaf } from 'lucide-react';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { CampaignSections } from '../CampaignSections';

const COLLABORATORS = [
  { slug: 'cbtw', name: 'Collaboration Betters The World (CBTW APAC)', count: 5 },
  { slug: 'vietduc', name: 'Viet Duc High School', count: 12 },
  { slug: 'ussh', name: 'University of Social Sciences and Humanities', count: 4 },
  { slug: 'youth', name: 'Youth Volunteers and Team Member', count: 20 },
  { slug: 'duonglieu', name: 'Duong Lieu Secondary School', count: 6 },
];

export const CommunityWorkshopPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Full-bleed banner */}
      <div className="w-full aspect-4/1 bg-slate-100 overflow-hidden">
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
        {/* Intro */}
        <div className="text-center mx-auto space-y-4 mb-14">
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
            resizable
            className="text-sm sm:text-base text-slate-600 leading-relaxed text-pretty"
          />
        </div>

        {/* Collaborators & their photos */}
        <div className="space-y-8">
          {COLLABORATORS.map(({ slug, name, count }) => (
            <div key={slug} className="bg-slate-50 rounded-3xl p-4 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-[#E81A7F] shrink-0" />
                <EditableText
                  contentKey={`workshop.collab.${slug}.name`}
                  defaultValue={name}
                  as="h3"
                  className="text-base sm:text-lg font-black text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {Array.from({ length: count }, (_, i) => i + 1).map((n) => (
                  <div key={n} className="rounded-xl overflow-hidden aspect-4/3 bg-slate-100">
                    <EditableImage
                      contentKey={`workshop.collab.${slug}.img${n}`}
                      defaultValue={`/images/community-workshop/${slug}/img${n}.jpg`}
                      alt={`${name} - photo ${n}`}
                      wrapperClassName="w-full h-full"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      <CampaignSections page="community-workshop" />

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
              resizable
              className="text-xs sm:text-sm text-slate-200 leading-relaxed"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
