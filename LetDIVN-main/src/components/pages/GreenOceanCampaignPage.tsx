import React from 'react';
import { ArrowLeft, CheckCircle2, Paintbrush, BookOpen, Users, Leaf } from 'lucide-react';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';

interface GreenOceanCampaignPageProps {
  onBack: () => void;
}

const OBJECTIVES = [
  'Raise public awareness and encourage local people of all age groups to take practical and positive actions towards zero-waste lifestyles and limit waste amount into the environment',
  "Enhance students' creation, interest and promote STEM initiatives in environmental protection",
  'Provide opportunities for the volunteers to "Experience the environment – Aware the current state of the environment – Change the behaviors and take action"',
  'Encourage and empower young people to take action to protect the environment',
  'Reduce the amount of waste released into the sea',
  "One team of young emerging leaders will be provided with a small fund, cleanup tools, and long-term consultancy from Let's Do It! Hanoi to maintain the project",
  'Make cleanup be a Culture, not just a Movement!',
  'Promote 9 Sustainable Development Goals (SDGs): 3, 6, 11, 12, 13, 14, 15, 16, 17',
];

const DIRECT_ACTIVITIES = [
  '02 Environmental Education Programs in 02 secondary schools with 2 activities including 01 training session and 01 recycling STEM festival',
  '02 Workshops of eco-friendly lifestyles for residential group leaders',
  '01 cleanup activities for volunteers at 01 beach',
  '01 online capacity-building workshop for young emerging leaders aged 15-22 (Nam Dinh Youth4Environment Program)',
];

const DIRECT_AUDIENCE = [
  'Secondary students: 2,000 people',
  'Residential group leaders: 50 people',
  'Youth groups and volunteers: 300 people',
  'Young emerging leaders: 30 people',
];

const PhotoGrid: React.FC<{ prefix: string; keys: string[]; alt: string }> = ({ prefix, keys, alt }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
    {keys.map((k, i) => (
      <div key={k} className="rounded-xl overflow-hidden aspect-4/3 bg-slate-100">
        <EditableImage
          contentKey={`greenocean.${prefix}.${k}`}
          defaultValue={`/images/green-ocean-campaign/${k}.jpg`}
          alt={`${alt} ${i + 1}`}
          wrapperClassName="w-full h-full"
          className="w-full h-full object-cover"
        />
      </div>
    ))}
  </div>
);

export const GreenOceanCampaignPage: React.FC<GreenOceanCampaignPageProps> = ({ onBack }) => {
  return (
    <div className="bg-white">
      {/* Full-bleed banner */}
      <div className="w-full aspect-3/1 bg-slate-100 overflow-hidden">
        <EditableImage
          contentKey="greenocean.banner"
          defaultValue="/images/green-ocean-campaign/banner.jpg"
          alt="A large group of students and volunteers on a beach holding an environmental cleanup program banner"
          wrapperClassName="w-full h-full"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Header on cream background */}
      <div className="bg-[#F8F6EA] py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#44ACAC] transition-colors cursor-pointer mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Projects</span>
          </button>

          <div className="text-center max-w-3xl mx-auto space-y-3 mb-6">
            <EditableText
              contentKey="greenocean.eyebrow"
              defaultValue="Tackle marine litter issues"
              as="p"
              className="text-sm sm:text-base font-bold text-[#FEAC13] uppercase tracking-wide"
            />
            <EditableText
              contentKey="greenocean.title"
              defaultValue="Green Ocean Campaign"
              as="h1"
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#44ACAC] tracking-tight leading-tight"
            />
            <EditableText
              contentKey="greenocean.intro"
              defaultValue='In order to raise the awareness of Vietnam local community in coastal cities and support adopting eco-friendly lifestyles, we run "Green Ocean" campaign in Nam Dinh (Vietnam) with several activities aiming at secondary school students, resident group leaders and young emerging leaders. Our vision is that marine litter issues in coastal cities will be minimized, when trash will be collected and sent to proper recycling places.'
              as="p"
              multiline
              className="text-sm sm:text-base text-slate-600 leading-relaxed"
            />
          </div>
        </div>
      </div>

      <div className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Project objectives */}
        <div className="mb-14">
          <EditableText
            contentKey="greenocean.objectivesTitle"
            defaultValue="Project objectives"
            as="h2"
            className="text-2xl sm:text-3xl font-black text-[#44ACAC] tracking-tight mb-6"
          />
          <ul className="space-y-3">
            {OBJECTIVES.map((text, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#44ACAC] shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-slate-600 leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Background */}
        <div className="mb-14">
          <EditableText
            contentKey="greenocean.backgroundTitle"
            defaultValue="Background"
            as="h2"
            className="text-2xl sm:text-3xl font-black text-[#44ACAC] tracking-tight mb-4"
          />
          <EditableText
            contentKey="greenocean.backgroundText"
            defaultValue="Increasing marine waste issues have been the hottest problems in Vietnam. However, these issues in coastal areas have not been paid enough attention. Nam Dinh is a typical coastal province facing these issues, especially in seaside areas because of the flow of major rivers and because people usually throw trash directly into the sea."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6"
          />
          <PhotoGrid prefix="background" keys={['intro1', 'intro2', 'intro3']} alt="Marine litter along the Nam Dinh coastline" />
        </div>

        {/* Main activity and target audience */}
        <div className="mb-14">
          <EditableText
            contentKey="greenocean.mainActivityTitle"
            defaultValue="Main activity and Target Audience"
            as="h2"
            className="text-2xl sm:text-3xl font-black text-[#44ACAC] tracking-tight mb-4"
          />
          <EditableText
            contentKey="greenocean.mainActivityText"
            defaultValue={'With over 3-year experience in raising people\'s awareness of trash issues in Hanoi, Let\'s Do It! Hanoi – a member of Let\'s Do It! World Network will launch "Green Ocean Campaign" in Nam Dinh Province in September 2021. Our vision is to minimize marine litter issues in coastal provinces and local residents will start adopting eco-friendly lifestyles.'}
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed"
          />
        </div>

        {/* Main activities / direct target audience */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14 bg-slate-50 rounded-3xl p-4 sm:p-8">
          <div>
            <EditableText
              contentKey="greenocean.mainActivitiesTitle"
              defaultValue="Main activities"
              as="h3"
              className="text-lg font-black text-[#44ACAC] tracking-tight mb-3"
            />
            <ul className="space-y-2">
              {DIRECT_ACTIVITIES.map((text, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#44ACAC] shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600 leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <EditableText
              contentKey="greenocean.directAudienceTitle"
              defaultValue="Direct target audience (2,380 people)"
              as="h3"
              className="text-lg font-black text-[#44ACAC] tracking-tight mb-3"
            />
            <ul className="space-y-2">
              {DIRECT_AUDIENCE.map((text, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#44ACAC] shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-600 leading-relaxed">{text}</span>
                </li>
              ))}
            </ul>
            <EditableText
              contentKey="greenocean.indirectAudienceTitle"
              defaultValue="Indirect target audience: local residents in 2 coastal districts – 451,776 people"
              as="p"
              multiline
              className="text-xs text-slate-500 leading-relaxed mt-4 italic"
            />
          </div>
        </div>

        {/* Environmental Education Program */}
        <div className="mb-14">
          <EditableText
            contentKey="greenocean.eduTitle"
            defaultValue="Environmental Education Program"
            as="h2"
            className="text-2xl sm:text-3xl font-black text-[#44ACAC] tracking-tight mb-6"
          />
          <PhotoGrid prefix="edu" keys={['edu1', 'edu2', 'edu3', 'edu4', 'edu5', 'edu6']} alt="Environmental Education Program activity" />
        </div>

        {/* Eco-friendly Workshop */}
        <div className="mb-14">
          <EditableText
            contentKey="greenocean.workshopTitle"
            defaultValue="Eco-friendly Workshop for residential group leaders — Giao Thinh & Hai Dong"
            as="h2"
            className="text-2xl sm:text-3xl font-black text-[#44ACAC] tracking-tight mb-6"
          />
          <PhotoGrid prefix="workshop" keys={['workshop1', 'workshop2', 'workshop3', 'workshop4', 'workshop5', 'workshop6']} alt="Eco-friendly lifestyle workshop" />
        </div>

        {/* Beach cleanup */}
        <div className="mb-14">
          <EditableText
            contentKey="greenocean.beachTitle"
            defaultValue="Beach cleanup"
            as="h2"
            className="text-2xl sm:text-3xl font-black text-[#44ACAC] tracking-tight mb-6"
          />
          <PhotoGrid prefix="beach" keys={['beach1', 'beach2', 'beach3', 'beach4']} alt="Beach cleanup activity" />
        </div>

        {/* Challenge */}
        <div className="mb-14">
          <EditableText
            contentKey="greenocean.challengeTitle"
            defaultValue="Challenge"
            as="h2"
            className="text-2xl sm:text-3xl font-black text-[#44ACAC] tracking-tight mb-4"
          />
          <EditableText
            contentKey="greenocean.challengeText"
            defaultValue="Covid has been our biggest challenge so far.

During the Covid-19 outbreak in Vietnam from August 2021 to March 2022, all activities in Vietnam were restricted. It is very hard to work with any local authorities or partners in Vietnam. Our activities can only be organized with the most effective results when they are organized offline.

Therefore, we have to wait until the Covid-19 situation is under control so that we can continue our activities."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed"
          />
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
              contentKey={`greenocean.${key}.title`}
              defaultValue={title}
              as="h3"
              className="text-lg font-black uppercase tracking-wide"
            />
            <EditableText
              contentKey={`greenocean.${key}.desc`}
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
