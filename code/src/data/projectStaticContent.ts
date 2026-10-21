export interface ProjectSubColumn {
  heading?: string;
  paragraphs: string[];
}

export interface ProjectSubBlock {
  /** Bold lead-in label — its own short sentence, not inline within `text` (e.g. "Opening Program, Visiting the National Park Museum..." on the YCSW page). */
  title: string;
  text: string;
  gallery?: string[];
}

export interface ProjectSection {
  heading?: string;
  paragraphs: string[];
  image?: string;
  /** A photo gallery grid shown under this section's text (e.g. an Elementor gallery widget on the source page). */
  gallery?: string[];
  /** Two side-by-side sub-blocks (e.g. "Main activities" | "Direct target audience" on the Green Ocean page). */
  columns?: ProjectSubColumn[];
  /** Render `paragraphs` as a bulleted list (dot-circle icon) instead of plain paragraphs. Explicit, not inferred from length. */
  bulletList?: boolean;
  /** Render `heading` like the page's main title (large, centered, title color) instead of the regular small amber sub-heading — matches mid-page "title-style" headings like World Cleanup Day's "From Now and Forever". */
  headingAsTitle?: boolean;
  /** Explicit gray/white band background. The reference site doesn't alternate these on a fixed idx%2 rule — it's per-section design — so default (unset) falls back to alternating by section index, and this overrides it when that default doesn't match. */
  band?: 'gray' | 'white';
  /** Vertically-stacked labeled sub-blocks, each with its own bold title, paragraph, and photo gallery — e.g. YCSW Activity 4's five day-by-day write-ups. Rendered after `paragraphs`. */
  subBlocks?: ProjectSubBlock[];
  /** Extra left-aligned paragraphs rendered after subBlocks — closingParagraphs[0] comes before closingBullets, the rest come after (e.g. a closing summary that mentions a bulleted list in the middle). */
  closingParagraphs?: string[];
  /** A left-aligned bulleted list rendered right after closingParagraphs[0], introduced by closingBulletsLabel. */
  closingBullets?: string[];
  /** Short lead-in line shown directly above closingBullets (e.g. "Key takeaways included:"). */
  closingBulletsLabel?: string;
  /** Renders this section as a single left-aligned "icon + label" row instead of the normal heading/paragraph layout — e.g. each participating organization on the Community Workshop page is its own full-width alternating-band row, not a bulleted list. Ignores heading/paragraphs/image/gallery. */
  personListItem?: string;
}

export interface ProjectStaticContent {
  hero: string;
  kicker?: string;
  title: string;
  /** Main title color, matching each campaign's brand accent on letsdoitvietnam.org. Defaults to brand pink. */
  titleColor?: string;
  sections: ProjectSection[];
}

/**
 * Static "about this campaign" content mirrored from the matching page on
 * letsdoitvietnam.org, keyed by CleanupEvent.category. Rendered above the
 * existing registration/map section on ProjectDetailPage.
 */
export const PROJECT_STATIC_CONTENT: Record<string, ProjectStaticContent> = {
  'World Cleanup Day': {
    hero: '/images/projects/wcd-hero.jpg',
    title: '20 September – World Cleanup Day',
    sections: [
      {
        paragraphs: [
          'World Cleanup Day has now been added to the official United Nations Calendar of International Days & Weeks from 2024 onwards! This presents even greater opportunities to unite tens of millions of participants in cross-sector cooperation, bringing citizens, governments, and organisations together to tackle the global mismanaged waste crisis and to help create a new, more sustainable and waste-free world. Join us on 20 September this year and every year!',
        ],
      },
      {
        paragraphs: [
          'Since 2018, World Cleanup Day has become the biggest civic movement in human history, uniting 211 countries and territories – which includes 95% of UN-listed countries – across the world, and 91 million volunteers, equal to 1.1% of the global population – all striving to create a cleaner planet.',
        ],
        image: '/images/projects/gallery/wcd-since1.jpg',
      },
      {
        paragraphs: [
          'World Cleanup Day harnesses the power of people around the world to achieve incredible things by joining together. Its beauty lies in cooperation and collaboration: building bridges between otherwise disparate communities – and including all levels and sectors of society – from citizens to businesses, to governments.',
        ],
        image: '/images/projects/gallery/wcd-since2.jpg',
      },
      {
        heading: 'From Now and Forever',
        headingAsTitle: true,
        paragraphs: [
          "This year's event takes place on Friday 20 September following our addition to the UN Calendar of International Days!",
          "We aim to activate 5% of the world's population that will catalyse lasting societal change in behaviour around mismanaged waste.",
        ],
      },
      {
        paragraphs: [
          'World Cleanup Day has since grown into a global movement across almost every nation and territory on the planet, with millions of volunteers and a strong network of charismatic leaders. The simple act of cleaning has become a force that binds together people and groups that would otherwise never dream of working towards the same goal.',
        ],
        image: '/images/projects/gallery/wcd-forever1.jpg',
      },
      {
        paragraphs: [
          'We are the very definition of unity in civic society, transcending traditional barriers to cooperation and bringing together global corporations and national governments. Our movement includes every nationality, age group, gender identity, and religious affiliation. We now act as a focal point for collective intelligence, raising awareness of the challenges our environment faces.',
        ],
        image: '/images/projects/gallery/wcd-forever2.jpg',
        gallery: [
          '/images/projects/gallery/wcd-gal1.jpg',
          '/images/projects/gallery/wcd-gal2.jpg',
          '/images/projects/gallery/wcd-gal3.jpg',
          '/images/projects/gallery/wcd-gal4.jpg',
        ],
      },
    ],
  },

  'Environmental Day': {
    hero: '/images/projects/envday-hero.jpg',
    title: 'Environmental Day',
    sections: [
      {
        band: 'white',
        paragraphs: [
          "The Splendor of Nature. It's a universal experience. Getting hands dirty, nurturing growth. Pausing to absorb its beauty and draw inspiration. Encouraging our community to appreciate nature's wonders – that's our mission! And thus, we are forming alliances with like-minded individuals who share our passion.",
        ],
      },
      {
        band: 'gray',
        paragraphs: [
          'Our focus is on blending the boundaries between nature and urban development, inviting nature into the city to influence how we design our urban environments. We are particularly enthusiastic about projects that incorporate elements such as native plants, trash sorting, and diverse environmental activities into our collaborations.',
        ],
        image: '/images/projects/envday-1.jpg',
      },
      {
        band: 'white',
        paragraphs: [
          "We are firm believers in ensuring that every individual in our community has the opportunity to embrace the wonders of nature on a daily basis. Whether it involves cultivating your own food, exploring the flora of the prairie, or seeking tranquility in a meditative garden, our goal is to enhance our community's accessibility to these enriching experiences.",
        ],
        image: '/images/projects/envday-2.jpg',
      },
      {
        band: 'white',
        heading: 'Create Valuable Sustainable Lifestyle',
        headingAsTitle: true,
        paragraphs: [
          'We offer a range of programs and initiatives designed to bring nature closer to everyone. For those interested in sustainable living, our urban workshops teach the basics of green lifestyle, even in small spaces. Our guided nature walks provide a deeper appreciation for the eco-friendly life that thrives in our region.',
        ],
      },
      {
        band: 'gray',
        paragraphs: [],
        gallery: [
          '/images/projects/gallery/envday-g1.jpg',
          '/images/projects/gallery/envday-g2.jpg',
          '/images/projects/gallery/envday-g3.jpg',
          '/images/projects/gallery/envday-g4.jpg',
          '/images/projects/gallery/envday-g5.jpg',
          '/images/projects/gallery/envday-g6.jpg',
        ],
      },
    ],
  },

  'Green Ocean Campaign': {
    hero: '/images/projects/goc-hero.jpg',
    kicker: 'Tackle marine litter issues',
    title: 'Green Ocean Campaign',
    titleColor: '#44ACAC',
    sections: [
      {
        paragraphs: [
          'In order to raise the awareness of Vietnam local community in coastal cities and support adopting eco-friendly lifestyles, we run the "Green Ocean" campaign in Nam Dinh (Vietnam) with several activities aiming at secondary school students, resident group leaders and young emerging leaders. Our vision is that marine litter issues in coastal cities will be minimized, when trash will be collected and sent to proper recycling places.',
        ],
      },
      {
        heading: 'Project objectives',
        bulletList: true,
        paragraphs: [
          'Raise public awareness and encourage local people of all age groups to take practical and positive actions towards zero-waste lifestyles and limit waste amount into the environment',
          "Enhance students' creation, interest and promote STEM initiatives in environmental protection",
          'Provide opportunities for volunteers to "Experience the environment – Aware the current state of the environment – Change the behaviors and take action"',
          'Encourage and empower young people to take action to protect the environment',
          'Reduce the amount of waste released into the sea',
          "One team of young emerging leaders will be provided with a small fund, cleanup tools, and long-term consultancy from Let's Do It! Hanoi to maintain the project",
          'Make cleanup a Culture, not just a Movement!',
          'Promote 9 Sustainable Development Goals (SDGs): 3, 6, 11, 12, 13, 14, 15, 16, 17',
        ],
      },
      {
        heading: 'Background',
        paragraphs: [
          'Increasing marine waste issues have been among the hottest problems in Vietnam. However, these issues in coastal areas have not been paid enough attention. Nam Dinh is a typical coastal province facing these issues, especially in seaside areas because of the flow of major rivers and because people usually throw trash directly into the sea.',
        ],
        gallery: [
          '/images/projects/gallery/goc-bg1.jpg',
          '/images/projects/gallery/goc-bg2.jpg',
          '/images/projects/gallery/goc-bg3.jpg',
        ],
      },
      {
        heading: 'Main activity and Target Audience',
        paragraphs: [
          "With over 3-year experience in raising people's awareness of trash issues in Hanoi, Let's Do It! Hanoi – a member of Let's Do It! World Network will launch \"Green Ocean Campaign\" in Nam Dinh Province in September 2021. Our vision is to minimize marine litter issues in coastal provinces and local residents will start adopting eco-friendly lifestyles.",
        ],
        columns: [
          {
            heading: 'Main activities',
            paragraphs: [
              '02 Environmental Education Programs in 02 secondary schools with 2 activities including 01 training session and 01 recycling STEM festival',
              '02 Workshops of eco-friendly lifestyles for residential group leaders',
              '01 cleanup activities for volunteers at 01 beach',
              '01 online capacity-building workshop for young emerging leaders aged 15-22 (Nam Dinh Youth4Environment Program)',
            ],
          },
          {
            heading: 'Direct target audience (2,380 people)',
            paragraphs: [
              'Secondary students: 2,000 people',
              'Residential group leaders: 50 people',
              'Youth groups and volunteers: 300 people',
              'Young emerging leaders: 30 people',
              'Indirect target audience and Demographic: local residents in 2 coastal districts (451,776 people)',
            ],
          },
        ],
      },
      {
        heading: 'Environmental Education Program',
        paragraphs: [],
        gallery: [
          '/images/projects/gallery/goc-edu1.jpg',
          '/images/projects/gallery/goc-edu2.jpg',
          '/images/projects/gallery/goc-edu3.jpg',
          '/images/projects/gallery/goc-edu4.jpg',
          '/images/projects/gallery/goc-edu5.jpg',
          '/images/projects/gallery/goc-edu6.jpg',
        ],
      },
      {
        heading: 'Eco-friendly Workshop for residential group leaders',
        paragraphs: [],
        columns: [
          { heading: 'Giao Thinh', paragraphs: [] },
          { heading: 'Hai Dong', paragraphs: [] },
        ],
        gallery: [
          '/images/projects/gallery/goc-gt1.jpg',
          '/images/projects/gallery/goc-gt2.jpg',
          '/images/projects/gallery/goc-gt3.jpg',
          '/images/projects/gallery/goc-gt4.jpg',
          '/images/projects/gallery/goc-hd1.jpg',
          '/images/projects/gallery/goc-hd2.jpg',
          '/images/projects/gallery/goc-hd3.jpg',
          '/images/projects/gallery/goc-hd4.jpg',
        ],
      },
      {
        heading: 'Beach cleanup',
        paragraphs: [],
        gallery: [
          '/images/projects/gallery/goc-beach1.jpg',
          '/images/projects/gallery/goc-beach2.jpg',
          '/images/projects/gallery/goc-beach3.jpg',
          '/images/projects/gallery/goc-beach4.jpg',
          '/images/projects/gallery/goc-beach5.jpg',
        ],
      },
      {
        heading: 'Challenge',
        paragraphs: [
          'Covid has been our biggest challenge so far. During the Covid-19 outbreak in Vietnam from August 2021 to March 2022, all activities in Vietnam were restricted. It was very hard to work with local authorities or partners in Vietnam, as our activities can only be organized with the most effective results when held offline. Therefore, we had to wait until the Covid-19 situation was under control so that we could continue our activities.',
        ],
      },
    ],
  },

  'Wildlife & Nature': {
    hero: '/images/projects/ycsw-hero.jpg',
    title: 'Young Conservationists to Save the Wildlife (YCSW)',
    sections: [
      {
        paragraphs: [
          'Young Conservationists to Save the Wildlife (YCSW) is an inspiring initiative under the Alumni Innovation Engagement Fund (AIEF) of the United States. The project aims to raise awareness among Vietnamese youth about wildlife conservation and the dangers of illegal wildlife trade.',
          "Although YCSW is not directly organized by Let's Do It Vietnam, a significant number of its members actively participate in operating and managing the project. Their contributions help drive impactful actions and foster a strong conservation mindset among young people.",
          "YCSW empowers Vietnam's youth to safeguard wildlife and combat illegal trafficking through education and action. With five online training sessions and hands-on volunteer days at Cuc Phuong National Park, the project has engaged 800 young people nationwide.",
          'A select 24 participants earned a field trip experience through a short film competition, amplifying their voices for conservation. Driven by U.S. exchange alumni, the program fosters a passionate, informed community dedicated to protecting endangered species and shaping a sustainable future.',
        ],
        image: '/images/projects/ycsw-1.jpg',
      },
      {
        heading: 'Activity 1: Sharing session on wildlife conservation from Pangolin conservation expert',
        headingAsTitle: true,
        paragraphs: [
          'To mark the launch of YCSW, a sharing session on April 28 featured Nguyen Van Thai, a "Conservation Hero" with over 16 years dedicated to pangolin protection. Nearly 30 young participants engaged in discussions, gaining deeper insights into Vietnam\'s conservation efforts and wildlife rescue work.',
          'Held at the American Center (Ngoc Khanh, Ba Dinh, Ha Noi), the event inspired attendees to take action in protecting endangered species and contributing to a sustainable future.',
        ],
        gallery: [
          '/images/projects/gallery/ycsw-act1-1.jpg',
          '/images/projects/gallery/ycsw-act1-2.jpg',
        ],
      },
      {
        heading: 'Activity 2: A series of five training sessions on nature and wildlife conservation',
        headingAsTitle: true,
        paragraphs: [
          'Following the kick-off event, YCSW launched its application process, selecting 800 passionate young individuals eager to protect nature and wildlife. Over 20 days, the program received an overwhelming 3,823 applications and 5,459 registrations, surpassing expectations by 5.4 times.',
          'Participants joined five interactive online training sessions on Zoom, equipping themselves with knowledge and skills to drive meaningful conservation efforts.',
        ],
        gallery: [
          '/images/projects/gallery/ycsw-a2-1.png',
          '/images/projects/gallery/ycsw-a2-2.png',
          '/images/projects/gallery/ycsw-a2-3.png',
          '/images/projects/gallery/ycsw-a2-4.png',
          '/images/projects/gallery/ycsw-a2-5.png',
        ],
      },
      {
        heading: 'Activity 3: Communication contest for short film production about wildlife',
        headingAsTitle: true,
        paragraphs: [
          'To select 24 passionate young individuals for a 5-day volunteer experience at Cuc Phuong National Park, YCSW launched a wildlife-themed short film contest. Participants—either solo or in teams of up to four—created impactful 3-minute films, showcasing their knowledge from five online training sessions and raising awareness of Vietnam\'s wildlife challenges.',
          'From 35 submitted films, the top 10 productions were chosen for the final pitching round, where creators presented their stories in an online format. These standout films encouraged communities to reject wildlife trade and consumption, demonstrating deep creativity and commitment.',
          'The selected filmmakers earned their place in an immersive field experience, putting their passion into action at Cuc Phuong National Park.',
        ],
        gallery: [
          '/images/projects/gallery/ycsw-act3-1.jpg',
          '/images/projects/gallery/ycsw-act3-2.jpg',
        ],
      },
      {
        heading: 'Activity 4: 5-day experience and volunteer in Cuc Phuong National Park',
        headingAsTitle: true,
        paragraphs: [
          "As one of the last activities in the program, the activity was built for young people to visit and experience wildlife rescue/conservation centers, including Save Vietnam's Wildlife, Endangered Primate Rescue Center, Turtle Conservation Center, and Ninh Binh Bear Sanctuary.",
        ],
        subBlocks: [
          {
            title: 'Opening Program, Visiting the National Park Museum and Trekking Observation Pavilion.',
            text: "On the first day, the program started with the opening ceremony with the participation of the U.S Embassy in Hanoi and, representatives of Cuc Phuong National Park, representatives of wildlife rescue centers – were 24 young people volunteering. After cleaning and settling down, you visited the Cuc Phuong National Park Museum and learned about the forest's creatures and the history of Cuc Phuong Forest. After finishing visiting the museum, you go trekking to the Observation hut about 1km from the resting place, where you can see the whole view of the Garden Gate area.",
            gallery: [
              '/images/projects/gallery/ycsw-act4-day1-1.jpg',
              '/images/projects/gallery/ycsw-act4-day1-2.jpg',
              '/images/projects/gallery/ycsw-act4-day1-3.jpg',
            ],
          },
          {
            title: 'Visiting and volunteering at the Center for Small Carnivores and Pangolins (Save Vietnam Wildlife).',
            text: 'On the second day, the young people learned about small carnivores and pangolins at the Center for Save Vietnam Wildlife in the morning. In the afternoon, you can participate in volunteer activities at the center: clean up the wildlife cage area, prepare food (crabs, fish, ants) for the animals in the center, mow the grass, provide food for animals and observe the behavior of mammals and pangolins. On the second day, in a series of five days ending with an evening activity, young people come together to brainstorm solutions and directions for activities to solve existing problems at Save Vietnam Wildlife.',
            gallery: [
              '/images/projects/gallery/ycsw-act4-day2-1.jpg',
              '/images/projects/gallery/ycsw-act4-day2-2.jpg',
              '/images/projects/gallery/ycsw-act4-day2-3.jpg',
            ],
          },
          {
            title: 'Turtle Rescue Center and Primate Rescue Center',
            text: "On the third day, you can visit and participate in volunteer activities at the Turtle Conservation Center in the morning and the Endangered Primate Rescue Center (EPRC) in the afternoon. Similar to the second day's activities, participants were introduced to the two centers' activities, goals, and missions. After that, the young people will be provided with crucial protective equipment such as wading boots, rubber gloves, and masks to participate in cleaning animal cages, clearing grass, and preparing food for wild animals. Along with that, you also got to observe interactive animals directly.",
            gallery: [
              '/images/projects/gallery/ycsw-act4-day3-1.jpg',
              '/images/projects/gallery/ycsw-act4-day3-2.jpg',
              '/images/projects/gallery/ycsw-act4-day3-3.jpg',
            ],
          },
          {
            title: 'Ninh Binh Bear Sanctuary, walking to see fireflies at night and Practicing survival camping.',
            text: 'On the fourth day, the young people went to the last wildlife conservation and rescue center, Ninh Binh Bear Sanctuary, operated by FOUR PAWS Vietnam. Here, young people can participate in the Workshop to introduce the center and learn about bear species in Vietnam and the risks and threats to bears. Here, young people can directly practice growing plants to replace bear bile – the product of illegal bear exploitation in Vietnam for many years. Young people have completed the Garden with the name "Bear bile plant garden – YCSW" at the main hall of Ninh Binh Bear Sanctuary. On the fourth day evening, you can participate in night firefly watching activities at Cuc Phuong National Park and practice overnight camping in the Garden.',
            gallery: [
              '/images/projects/gallery/ycsw-act4-day4-1.jpg',
              '/images/projects/gallery/ycsw-act4-day4-2.jpg',
              '/images/projects/gallery/ycsw-act4-day4-3.jpg',
            ],
          },
          {
            title: 'Trekking in the forest, Van Long lagoon, Summary',
            text: 'On the last day of the five-day series, 24 young people participated in trekking for nearly 5 hours. Before trekking, you are guided to prepare the essential tools for the activity, safe methods of moving in the forest, and interacting with the animals in the forest; after finishing trekking and taking a lunch break. After trekking, you can visit Van Long Lagoon and learn about the endangered langurs of Vietnam. Also, the program held a summary activity for the five-day journey.',
            gallery: [
              '/images/projects/gallery/ycsw-act4-day5-1.jpg',
              '/images/projects/gallery/ycsw-act4-day5-2.jpg',
              '/images/projects/gallery/ycsw-act4-day5-3.jpg',
            ],
          },
        ],
        closingParagraphs: [
          'From July 14 to July 18, YCSW led a five-day hands-on experience at Cuc Phuong National Park (Ngo Quan, Ninh Binh), where young participants engaged in the care and conservation of endangered species such as pangolins, otters, turtles, macaques, and bears. Building on their online training, this real-world exposure fueled innovative ideas and inspired action.',
          'Beyond training, the program strengthened connections among alumni in Vietnam\'s wildlife and environmental sectors. Through effective outreach, the project highlighted alumni contributions while fostering collaboration for future conservation initiatives.',
          'With nearly 3,500 applications, the overwhelming interest underscores public engagement and youth commitment to conservation. These participants now represent a vital force, ready to contribute to government agencies, NGOs, and social projects dedicated to nature and wildlife protection.',
        ],
        closingBulletsLabel: 'Key takeaways included:',
        closingBullets: [
          "Authentic encounters with Vietnam's wildlife",
          'Deepened understanding of conservation culture and nature connections',
          'Hands-on learning of wildlife care and protection methods',
          'Guidance from experts at conservation centers',
        ],
      },
    ],
  },

  'Workshop & Education': {
    hero: '/images/projects/cw-hero.jpg',
    title: 'Community Workshop',
    sections: [
      {
        band: 'white',
        paragraphs: [
          "The Community Workshop is part of a broader initiative aimed at environmental protection and sustainability. These workshops are organized under the umbrella of the global Let's Do It! World movement, which focuses on tackling environmental issues through community-driven efforts.",
        ],
      },
      { band: 'white', personListItem: 'Collaboration Betters The World (CBTW APAC)', paragraphs: [] },
      { band: 'gray', personListItem: 'Viet Duc High school', paragraphs: [] },
      { band: 'white', personListItem: 'University of Social Sciences and Humanities', paragraphs: [] },
      { band: 'gray', personListItem: 'Youth Volunteers and Team Member', paragraphs: [] },
      { band: 'white', personListItem: 'Duong Lieu Secondary School', paragraphs: [] },
    ],
  },
};
