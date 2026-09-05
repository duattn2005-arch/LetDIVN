import React from 'react';
import { ArrowLeft, Paintbrush, BookOpen, Users, Leaf } from 'lucide-react';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';

interface YoungConservationistsPageProps {
  onBack: () => void;
}

export const YoungConservationistsPage: React.FC<YoungConservationistsPageProps> = ({ onBack }) => {
  return (
    <div className="bg-white">
      {/* Full-bleed banner */}
      <div className="w-full aspect-3/1 bg-slate-100 overflow-hidden">
        <EditableImage
          contentKey="ycsw.banner"
          defaultValue="/images/young-conservationists/banner.jpg"
          alt="Young Conservationists to Save the Wildlife participants holding tote bags at a training session"
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
            contentKey="ycsw.title"
            defaultValue="Young Conservationists to Save the Wildlife (YCSW)"
            as="h1"
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#E81A7F] tracking-tight leading-tight"
          />
          <EditableText
            contentKey="ycsw.intro"
            defaultValue="Young Conservationists to Save the Wildlife (YCSW) is an inspiring initiative under the Alumni Innovation Engagement Fund (AIEF) of the United States. The project aims to raise awareness among Vietnamese youth about wildlife conservation and the dangers of illegal wildlife trade.

Although YCSW is not directly organized by Let's Do It Vietnam, a significant number of its members actively participate in operating and managing the project. Their contributions help drive impactful actions and foster a strong conservation mindset among young people."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed"
          />
        </div>

        {/* Block: image left, text right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-14 bg-slate-50 rounded-3xl p-4 sm:p-8">
          <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100">
            <EditableImage
              contentKey="ycsw.intro.image"
              defaultValue="/images/young-conservationists/intro.jpg"
              alt="Volunteers observing wildlife in a forest stream"
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover"
            />
          </div>
          <EditableText
            contentKey="ycsw.intro.text"
            defaultValue="YCSW empowers Vietnam's youth to safeguard wildlife and combat illegal trafficking through education and action. With five online training sessions and hands-on volunteer days at Cuc Phuong National Park, the project has engaged 800 young people nationwide.

A select 24 participants earned a field trip experience through a short film competition, amplifying their voices for conservation. Driven by U.S. exchange alumni, the program fosters a passionate, informed community dedicated to protecting endangered species and shaping a sustainable future."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed"
          />
        </div>

        {/* Activity 1 */}
        <div className="mb-14">
          <EditableText
            contentKey="ycsw.activity1.title"
            defaultValue="Activity 1: Sharing session on wildlife conservation from a pangolin conservation expert"
            as="h2"
            className="text-xl sm:text-2xl font-black text-[#E81A7F] tracking-tight mb-4"
          />
          <EditableText
            contentKey="ycsw.activity1.text"
            defaultValue="To mark the launch of YCSW, a sharing session on April 28 featured Nguyen Van Thai, a “Conservation Hero” with over 16 years dedicated to pangolin protection. Nearly 30 young participants engaged in discussions, gaining deeper insights into Vietnam's conservation efforts and wildlife rescue work.

Held at the American Center (Ngoc Khanh, Ba Dinh, Ha Noi), the event inspired attendees to take action in protecting endangered species and contributing to a sustainable future."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100">
              <EditableImage
                contentKey="ycsw.activity1.image1"
                defaultValue="/images/young-conservationists/activity1-1.jpg"
                alt="Sharing session on pangolin conservation"
                wrapperClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100">
              <EditableImage
                contentKey="ycsw.activity1.image2"
                defaultValue="/images/young-conservationists/activity1-2.jpg"
                alt="Participants at the wildlife conservation sharing session"
                wrapperClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Activity 3 */}
        <div className="mb-14">
          <EditableText
            contentKey="ycsw.activity3.title"
            defaultValue="Activity 3: Communication contest for short film production about wildlife"
            as="h2"
            className="text-xl sm:text-2xl font-black text-[#E81A7F] tracking-tight mb-4"
          />
          <EditableText
            contentKey="ycsw.activity3.text"
            defaultValue="To select 24 passionate young individuals for a 5-day volunteer experience at Cuc Phuong National Park, YCSW launched a wildlife-themed short film contest. Participants created impactful 3-minute films, showcasing their knowledge from five online training sessions and raising awareness of Vietnam's wildlife challenges.

From 35 submitted films, the top 10 productions were chosen for the final pitching round. The selected filmmakers earned their place in an immersive field experience, putting their passion into action at Cuc Phuong National Park."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100">
              <EditableImage
                contentKey="ycsw.activity3.image1"
                defaultValue="/images/young-conservationists/activity3-1.jpg"
                alt="Short film contest finalists"
                wrapperClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100">
              <EditableImage
                contentKey="ycsw.activity3.image2"
                defaultValue="/images/young-conservationists/activity3-2.jpg"
                alt="Short film production about wildlife conservation"
                wrapperClassName="w-full h-full"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Activity 4 */}
        <div className="mb-14">
          <EditableText
            contentKey="ycsw.activity4.title"
            defaultValue="Activity 4: 5-day experience and volunteering at Cuc Phuong National Park"
            as="h2"
            className="text-xl sm:text-2xl font-black text-[#E81A7F] tracking-tight mb-4"
          />
          <EditableText
            contentKey="ycsw.activity4.text"
            defaultValue="From July 14 to July 18, YCSW led a five-day hands-on experience at Cuc Phuong National Park (Nho Quan, Ninh Binh), where young participants engaged in the care and conservation of endangered species such as pangolins, otters, turtles, macaques, and bears — visiting Save Vietnam's Wildlife, the Endangered Primate Rescue Center, the Turtle Conservation Center, and Ninh Binh Bear Sanctuary.

Beyond training, the program strengthened connections among alumni in Vietnam's wildlife and environmental sectors. With nearly 3,500 applications, the overwhelming interest underscores public engagement and youth commitment to conservation."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['activity4-1', 'activity4-2', 'activity4-3', 'activity4-4'].map((k) => (
              <div key={k} className="rounded-2xl overflow-hidden aspect-4/3 bg-slate-100">
                <EditableImage
                  contentKey={`ycsw.${k}`}
                  defaultValue={`/images/young-conservationists/${k}.jpg`}
                  alt="Volunteering at Cuc Phuong National Park"
                  wrapperClassName="w-full h-full"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
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
              contentKey={`ycsw.${key}.title`}
              defaultValue={title}
              as="h3"
              className="text-lg font-black uppercase tracking-wide"
            />
            <EditableText
              contentKey={`ycsw.${key}.desc`}
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
