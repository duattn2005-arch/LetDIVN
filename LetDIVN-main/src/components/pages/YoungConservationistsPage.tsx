import React from 'react';
import { Paintbrush, BookOpen, Users, Leaf } from 'lucide-react';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { CampaignSections } from '../CampaignSections';

export const YoungConservationistsPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Full-bleed banner */}
      <div className="w-full aspect-4/1 bg-slate-100 overflow-hidden">
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
        <div className="mb-14 bg-slate-50 rounded-3xl p-4 sm:p-8">
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

        {/* Activity 2 */}
        <div className="mb-14 bg-slate-50 rounded-3xl p-4 sm:p-8">
          <EditableText
            contentKey="ycsw.activity2.title"
            defaultValue="Activity 2: A series of five training sessions on nature and wildlife conservation"
            as="h2"
            className="text-xl sm:text-2xl font-black text-[#E81A7F] tracking-tight mb-4"
          />
          <EditableText
            contentKey="ycsw.activity2.text"
            defaultValue="Following the kick-off event, YCSW launched its application process, selecting 800 passionate young individuals eager to protect nature and wildlife. Over 20 days, the program received an overwhelming 3,823 applications and 5,459 registrations, surpassing expectations by 5.4 times.

Participants joined five interactive online training sessions on Zoom, equipping themselves with knowledge and skills to drive meaningful conservation efforts."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {['act2-1', 'act2-2', 'act2-3', 'act2-4', 'act2-5'].map((k) => (
              <div key={k} className="rounded-2xl overflow-hidden aspect-[7/2] bg-slate-100">
                <EditableImage
                  contentKey={`ycsw.${k}`}
                  defaultValue={`/images/young-conservationists/${k}.png`}
                  alt="Online training session on nature and wildlife conservation"
                  wrapperClassName="w-full h-full"
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Activity 3 */}
        <div className="mb-14 bg-slate-50 rounded-3xl p-4 sm:p-8">
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
        <div className="mb-14 bg-slate-50 rounded-3xl p-4 sm:p-8">
          <EditableText
            contentKey="ycsw.activity4.title"
            defaultValue="Activity 4: 5-day experience and volunteer in Cuc Phuong National Park"
            as="h2"
            className="text-xl sm:text-2xl font-black text-[#E81A7F] tracking-tight mb-4"
          />
          <EditableText
            contentKey="ycsw.activity4.intro"
            defaultValue="As one of the last activities in the program, this activity was built for young people to visit and experience wildlife rescue and conservation centers, including Save Vietnam's Wildlife, the Endangered Primate Rescue Center, the Turtle Conservation Center, and Ninh Binh Bear Sanctuary."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8"
          />

          {[
            {
              day: 'day1',
              title: 'Day 1 — Opening Program, Visiting the National Park Museum and Trekking Observation Pavilion',
              text: "On the first day, the program started with the opening ceremony with the participation of the U.S. Embassy in Hanoi, representatives of Cuc Phuong National Park, and representatives of wildlife rescue centers — with 24 young people volunteering. After settling in, participants visited the Cuc Phuong National Park Museum and learned about the forest's creatures and the history of Cuc Phuong Forest, then went trekking to the observation hut about 1km away, where they could see the whole view of the Garden Gate area.",
              images: ['day1-1', 'day1-2', 'day1-3'],
            },
            {
              day: 'day2',
              title: 'Day 2 — Visiting and Volunteering at the Center for Small Carnivores and Pangolins (Save Vietnam Wildlife)',
              text: 'On the second day, the young people learned about small carnivores and pangolins at the Save Vietnam Wildlife Center in the morning. In the afternoon, they took part in volunteer activities: cleaning up the wildlife cage area, preparing food (crabs, fish, ants) for the animals, mowing the grass, and observing the behavior of mammals and pangolins. In the evening, participants came together to brainstorm solutions and directions for tackling existing problems at Save Vietnam Wildlife.',
              images: ['day2-1', 'day2-2', 'day2-3'],
            },
            {
              day: 'day3',
              title: 'Day 3 — Turtle Rescue Center and Primate Rescue Center',
              text: "On the third day, participants visited and volunteered at the Turtle Conservation Center in the morning and the Endangered Primate Rescue Center (EPRC) in the afternoon. After being introduced to each center's activities, goals, and missions, the young people were given protective equipment — wading boots, rubber gloves, and masks — to clean animal cages, clear grass, and prepare food for wild animals, while also observing the animals directly.",
              images: ['day3-1', 'day3-2', 'day3-3'],
            },
            {
              day: 'day4',
              title: 'Day 4 — Ninh Binh Bear Sanctuary, Firefly Watching at Night and Survival Camping',
              text: 'On the fourth day, the group visited the last conservation center, Ninh Binh Bear Sanctuary, operated by FOUR PAWS Vietnam. Here they joined a workshop introducing the center and the bear species of Vietnam, along with the risks and threats bears face, and practiced growing plants to replace bear bile — the product of illegal bear exploitation. The group completed a garden named "Bear Bile Plant Garden – YCSW" at the sanctuary\'s main hall. In the evening, participants watched fireflies at Cuc Phuong National Park and practiced overnight camping in the garden.',
              images: ['day4-1', 'day4-2', 'day4-3'],
            },
            {
              day: 'day5',
              title: 'Day 5 — Trekking in the Forest, Van Long Lagoon, Summary',
              text: "On the last day, the 24 young people took part in nearly 5 hours of trekking, first being guided on the essential tools, safe movement in the forest, and how to interact with forest animals. After trekking and a lunch break, the group visited Van Long Lagoon and learned about Vietnam's endangered langurs, before the program closed with a summary activity for the whole five-day journey.",
              images: ['day5-1', 'day5-2', 'day5-3'],
            },
          ].map(({ day, title, text, images }) => (
            <div key={day} className="mb-10">
              <EditableText
                contentKey={`ycsw.${day}.title`}
                defaultValue={title}
                as="h3"
                className="text-base sm:text-lg font-bold text-slate-900 mb-2"
              />
              <EditableText
                contentKey={`ycsw.${day}.text`}
                defaultValue={text}
                as="p"
                multiline
                className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4"
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {images.map((k) => (
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
          ))}

          <EditableText
            contentKey="ycsw.activity4.text"
            defaultValue="From July 14 to July 18, YCSW led a five-day hands-on experience at Cuc Phuong National Park (Nho Quan, Ninh Binh), where young participants engaged in the care and conservation of endangered species such as pangolins, otters, turtles, macaques, and bears — visiting Save Vietnam's Wildlife, the Endangered Primate Rescue Center, the Turtle Conservation Center, and Ninh Binh Bear Sanctuary.

Beyond training, the program strengthened connections among alumni in Vietnam's wildlife and environmental sectors. With nearly 3,500 applications, the overwhelming interest underscores public engagement and youth commitment to conservation."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed"
          />
        </div>
      </div>
      </div>

      <CampaignSections page="young-conservationists" />

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
