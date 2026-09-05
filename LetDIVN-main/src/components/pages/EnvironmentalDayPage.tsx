import React from 'react';
import { ArrowLeft, Paintbrush, BookOpen, Users, Leaf } from 'lucide-react';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';

interface EnvironmentalDayPageProps {
  onBack: () => void;
}

export const EnvironmentalDayPage: React.FC<EnvironmentalDayPageProps> = ({ onBack }) => {
  return (
    <div className="bg-white">
      {/* Full-bleed banner */}
      <div className="w-full aspect-3/1 bg-slate-100 overflow-hidden">
        <EditableImage
          contentKey="envday.banner"
          defaultValue="/images/environmental-day/banner.jpg"
          alt="Eco-friendly gift bags, succulents, and notebooks laid out on a table at a Green Living Festival"
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
            contentKey="envday.title"
            defaultValue="Environmental Day"
            as="h1"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#E81A7F] tracking-tight leading-tight"
          />
          <EditableText
            contentKey="envday.intro"
            defaultValue="The Splendor of Nature. It's a universal experience.
Getting hands dirty, nurturing growth. Pausing to absorb its beauty and draw inspiration. Encouraging our community to appreciate nature's wonders – that's our mission!
And thus, we are forming alliances with like-minded individuals who share our passion."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed"
          />
        </div>

        {/* Block 1: image left, text right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-14 bg-slate-50 rounded-3xl p-4 sm:p-8">
          <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100">
            <EditableImage
              contentKey="envday.block1.image"
              defaultValue="/images/environmental-day/block1.jpg"
              alt="Children potting succulents together at an environmental festival"
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
          </div>
          <EditableText
            contentKey="envday.block1.text"
            defaultValue="Our focus is on blending the boundaries between nature and urban development, inviting nature into the city to influence how we design our urban environments. We are particularly enthusiastic about projects that incorporate elements such as native plants, trash sorting, and diverse environmental activities into our collaborations."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed"
          />
        </div>

        {/* Block 2: text left, image right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-14">
          <EditableText
            contentKey="envday.block2.text"
            defaultValue="We are firm believers in ensuring that every individual in our community has the opportunity to embrace the wonders of nature on a daily basis. Whether it involves cultivating your own food, exploring the flora of the prairie, or seeking tranquility in a meditative garden, our goal is to enhance our community's accessibility to these enriching experiences."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed order-2 lg:order-1"
          />
          <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 order-1 lg:order-2">
            <EditableImage
              contentKey="envday.block2.image"
              defaultValue="/images/environmental-day/block2.jpg"
              alt="A family browsing plant pots at an environmental festival"
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Create Valuable Sustainable Lifestyle */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <EditableText
            contentKey="envday.sustainableTitle"
            defaultValue="Create Valuable Sustainable Lifestyle"
            as="h2"
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#E81A7F] tracking-tight"
          />
          <EditableText
            contentKey="envday.sustainableText"
            defaultValue="We offer a range of programs and initiatives designed to bring nature closer to everyone. For those interested in sustainable living, our urban workshops teach the basics of green lifestyle, even in small spaces. Our guided nature walks tour provide a deeper appreciation for the Eco-friendly life that thrive in our region."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed"
          />
        </div>

        {/* Gallery row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-14">
          <div className="rounded-2xl overflow-hidden aspect-3/2 bg-slate-100">
            <EditableImage
              contentKey="envday.gallery1"
              defaultValue="/images/environmental-day/gallery1.jpg"
              alt="Volunteers hosting an environmental activities booth"
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-2xl overflow-hidden aspect-3/2 bg-slate-100">
            <EditableImage
              contentKey="envday.gallery2"
              defaultValue="/images/environmental-day/gallery2.jpg"
              alt="Visitors exploring the Green Living Festival"
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
          </div>
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
              contentKey={`envday.${key}.title`}
              defaultValue={title}
              as="h3"
              className="text-lg font-black uppercase tracking-wide"
            />
            <EditableText
              contentKey={`envday.${key}.desc`}
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
