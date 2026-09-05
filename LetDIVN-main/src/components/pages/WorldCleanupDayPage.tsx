import React from 'react';
import { ArrowLeft, Paintbrush, BookOpen, Users, Leaf } from 'lucide-react';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';

interface WorldCleanupDayPageProps {
  onBack: () => void;
}

export const WorldCleanupDayPage: React.FC<WorldCleanupDayPageProps> = ({ onBack }) => {
  return (
    <div className="py-10 sm:py-14 bg-white">
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
            contentKey="wcd.title"
            defaultValue="20 September – World Cleanup Day"
            as="h1"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#E81A7F] tracking-tight leading-tight"
          />
          <EditableText
            contentKey="wcd.intro"
            defaultValue="World Cleanup Day has now been added to the official United Nations Calendar of International Days & Weeks from 2024 onwards! This presents even greater opportunties to unite tens of millions participants in cross-sector cooperation, bringing citizens, governments, and organisations together to tackle the global mismanaged waste crisis and to help create a new, more sustainable and waste-free world. Join us on 20 September this year and every year!"
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed"
          />
        </div>

        {/* Block 1: image left, text right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-14 bg-slate-50 rounded-3xl p-4 sm:p-8">
          <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100">
            <EditableImage
              contentKey="wcd.block1.image"
              defaultValue="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1000&auto=format&fit=crop&q=80"
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

        {/* Block 2: text left, image right */}
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
          <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 order-1 lg:order-2">
            <EditableImage
              contentKey="wcd.block2.image"
              defaultValue="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop&q=80"
              alt="Volunteers planning a cleanup route"
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* From Now and Forever */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <EditableText
            contentKey="wcd.fromNowTitle"
            defaultValue="From Now and Forever"
            as="h2"
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#E81A7F] tracking-tight"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-14 bg-slate-50 rounded-3xl p-4 sm:p-8">
          <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100">
            <EditableImage
              contentKey="wcd.block3.image"
              defaultValue="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000&auto=format&fit=crop&q=80"
              alt="Volunteers taking a photo together"
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

        {/* Block 4: text left, image right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-14">
          <EditableText
            contentKey="wcd.block4.text"
            defaultValue="We are the very definition of unity in civic society, transcending traditional barriers to cooperation and bringing together global corporations and national governments. Our movement includes every nationality, age group, gender identity, and religious affiliation. We now act as a focal point for collective intelligence, raising awareness of the challenges our environment faces."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed order-2 lg:order-1"
          />
          <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100 order-1 lg:order-2">
            <EditableImage
              contentKey="wcd.block4.image"
              defaultValue="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1000&auto=format&fit=crop&q=80"
              alt="Volunteer walking along a cleanup route"
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 2-photo row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100">
            <EditableImage
              contentKey="wcd.gallery1"
              defaultValue="https://images.unsplash.com/photo-1528190336454-13cd56b45b5a?w=1000&auto=format&fit=crop&q=80"
              alt="Volunteers resting together"
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100">
            <EditableImage
              contentKey="wcd.gallery2"
              defaultValue="https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=1000&auto=format&fit=crop&q=80"
              alt="Volunteers loading collected waste"
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover"
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
              contentKey={`wcd.${key}.title`}
              defaultValue={title}
              as="h3"
              className="text-lg font-black uppercase tracking-wide"
            />
            <EditableText
              contentKey={`wcd.${key}.desc`}
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
