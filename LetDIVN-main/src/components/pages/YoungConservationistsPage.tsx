import React from 'react';
import { Paintbrush, BookOpen, Users, Leaf, CheckCircle2 } from 'lucide-react';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { CampaignSections } from '../CampaignSections';

const KEY_TAKEAWAYS = [
  "Authentic encounters with Vietnam's wildlife",
  'Deepened understanding of conservation culture and nature connections',
  'Hands-on learning of wildlife care and protection methods',
  'Guidance from experts at conservation centers',
];

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

      {/* Title + Intro */}
      <div className="py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
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
              className="text-sm sm:text-base text-slate-600 leading-relaxed text-pretty"
            />
          </div>
        </div>
      </div>

      {/* Gray band 1: intro image+text block + Activity 1 */}
      <div className="bg-[#F2F2F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 sm:space-y-14">
          {/* Block: image left, text right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
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
          <div>
            <EditableText
              contentKey="ycsw.activity1.title"
              defaultValue="Activity 1: Sharing session on wildlife conservation from Pangolin conservation expert"
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
        </div>
      </div>

      {/* Gray band 2: Activity 2 + Activity 3 */}
      <div className="bg-[#F2F2F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10 sm:space-y-14">
          {/* Activity 2 */}
          <div>
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
          <div>
            <EditableText
              contentKey="ycsw.activity3.title"
              defaultValue="Activity 3: Communication contest for short film production about wildlife"
              as="h2"
              className="text-xl sm:text-2xl font-black text-[#E81A7F] tracking-tight mb-4"
            />
            <EditableText
              contentKey="ycsw.activity3.text"
              defaultValue="To select 24 passionate young individuals for a 5-day volunteer experience at Cuc Phuong National Park, YCSW launched a wildlife-themed short film contest. Participants—either solo or in teams of up to four—created impactful 3-minute films, showcasing their knowledge from five online training sessions and raising awareness of Vietnam's wildlife challenges.

From 35 submitted films, the top 10 productions were chosen for the final pitching round, where creators presented their stories in an online format. These standout films encouraged communities to reject wildlife trade and consumption, demonstrating deep creativity and commitment.

The selected filmmakers earned their place in an immersive field experience, putting their passion into action at Cuc Phuong National Park."
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
        </div>
      </div>

      {/* Gray band 3: Activity 4 (5-day breakdown) + Key takeaways + closing */}
      <div className="bg-[#F2F2F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <EditableText
            contentKey="ycsw.activity4.title"
            defaultValue="Activity 4: 5-day experience and volunteer in Cuc Phuong National Park"
            as="h2"
            className="text-xl sm:text-2xl font-black text-[#E81A7F] tracking-tight mb-4"
          />
          <EditableText
            contentKey="ycsw.activity4.intro"
            defaultValue="As one of the last activities in the program, the activity was built for young people to visit and experience wildlife rescue/conservation centers, including Save Vietnam's Wildlife, Endangered Primate Rescue Center, Turtle Conservation Center, and Ninh Binh Bear Sanctuary."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8"
          />

          {[
            {
              day: 'day1',
              title: 'Opening Program, Visiting the National Park Museum and Trekking Observation Pavilion.',
              text: "On the first day, the program started with the opening ceremony with the participation of the U.S Embassy in Hanoi and, representatives of Cuc Phuong National Park, representatives of wildlife rescue centers – were 24 young people volunteering. After cleaning and settling down, you visited the Cuc Phuong National Park Museum and learned about the forest's creatures and the history of Cuc Phuong Forest. After finishing visiting the museum, you go trekking to the Observation hut about 1km from the resting place, where you can see the whole view of the Garden Gate area.",
              images: ['day1-1', 'day1-2', 'day1-3'],
            },
            {
              day: 'day2',
              title: 'Visiting and volunteering at the Center for Small Carnivores and Pangolins (Save Vietnam Wildlife).',
              text: 'On the second day, the young people learned about small carnivores and pangolins at the Center for Save Vietnam Wildlife in the morning. In the afternoon, you can participate in volunteer activities at the center: clean up the wildlife cage area, prepare food (crabs, fish, ants) for the animals in the center, mow the grass, provide food for animals and observe the behavior of mammals and pangolins. On the second day, in a series of five days ending with an evening activity, young people come together to brainstorm solutions and directions for activities to solve existing problems at Save Vietnam Wildlife.',
              images: ['day2-1', 'day2-2', 'day2-3'],
            },
            {
              day: 'day3',
              title: 'Turtle Rescue Center and Primate Rescue Center',
              text: "On the third day, you can visit and participate in volunteer activities at the Turtle Conservation Center in the morning and the Endangered Primate Rescue Center (EPRC) in the afternoon. Similar to the second day's activities, participants were introduced to the two centers' activities, goals, and missions. After that, the young people will be provided with crucial protective equipment such as wading boots, rubber gloves, and masks to participate in cleaning animal cages, clearing grass, and preparing food for wild animals. Along with that, you also got to observe interactive animals directly.",
              images: ['day3-1', 'day3-2', 'day3-3'],
            },
            {
              day: 'day4',
              title: 'Ninh Binh Bear Sanctuary, walking to see fireflies at night and Practicing survival camping.',
              text: 'On the fourth day, the young people went to the last wildlife conservation and rescue center, Ninh Binh Bear Sanctuary, operated by FOUR PAWS Vietnam. Here, young people can participate in the Workshop to introduce the center and learn about bear species in Vietnam and the risks and threats to bears. Here, young people can directly practice growing plants to replace bear bile – the product of illegal bear exploitation in Vietnam for many years. Young people have completed the Garden with the name "Bear bile plant garden – YCSW" at the main hall of Ninh Binh Bear Sanctuary. On the fourth day evening, you can participate in night firefly watching activities at Cuc Phuong National Park and practice overnight camping in the Garden.',
              images: ['day4-1', 'day4-2', 'day4-3'],
            },
            {
              day: 'day5',
              title: 'Trekking in the forest, Van Long lagoon, Summary',
              text: "On the last day of the five-day series, 24 young people participated in trekking for nearly 5 hours. Before trekking, you are guided to prepare the essential tools for the activity, safe methods of moving in the forest, and interacting with the animals in the forest; after finishing trekking and taking a lunch break. After trekking, you can visit Van Long Lagoon and learn about the endangered langurs of Vietnam. Also, the program held a summary activity for the five-day journey.",
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
            defaultValue="From July 14 to July 18, YCSW led a five-day hands-on experience at Cuc Phuong National Park (Ngo Quan, Ninh Binh), where young participants engaged in the care and conservation of endangered species such as pangolins, otters, turtles, macaques, and bears. Building on their online training, this real-world exposure fueled innovative ideas and inspired action."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6"
          />

          <EditableText
            contentKey="ycsw.activity4.takeawaysTitle"
            defaultValue="Key takeaways included:"
            as="p"
            className="text-sm sm:text-base font-bold text-slate-900 mb-3"
          />
          <ul className="space-y-2 mb-6">
            {KEY_TAKEAWAYS.map((text, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#E81A7F] shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-slate-600 leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>

          <EditableText
            contentKey="ycsw.activity4.closing"
            defaultValue="Beyond training, the program strengthened connections among alumni in Vietnam's wildlife and environmental sectors. Through effective outreach, the project highlighted alumni contributions while fostering collaboration for future conservation initiatives.

With nearly 3,500 applications, the overwhelming interest underscores public engagement and youth commitment to conservation. These participants now represent a vital force, ready to contribute to government agencies, NGOs, and social projects dedicated to nature and wildlife protection."
            as="p"
            multiline
            className="text-sm sm:text-base text-slate-600 leading-relaxed"
          />
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
