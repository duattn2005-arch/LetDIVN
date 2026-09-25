export interface MediaCoverageEntry {
  title: string;
  articles: number;
  segments: number;
  image: string;
  pdf: string;
}

/**
 * Press/TV coverage summary per campaign, mirrored from the "Media on Us"
 * page on letsdoitvietnam.org. Each entry links to a PDF listing the
 * individual articles and broadcast segments counted for that campaign.
 */
export const MEDIA_ON_US_ENTRIES: MediaCoverageEntry[] = [
  {
    title: 'World Cleanup Day 2019',
    articles: 10,
    segments: 7,
    image: '/images/media-on-us/m01.jpg',
    pdf: '/media-coverage/world-cleanup-day-2019.pdf',
  },
  {
    title: 'World Cleanup Day 2020',
    articles: 20,
    segments: 3,
    image: '/images/media-on-us/m02.jpg',
    pdf: '/media-coverage/world-cleanup-day-2020.pdf',
  },
  {
    title: 'Green Ocean Campaign 2021',
    articles: 10,
    segments: 3,
    image: '/images/media-on-us/m03.jpg',
    pdf: '/media-coverage/green-ocean-campaign-2021.pdf',
  },
  {
    title: 'World Cleanup Day 2022',
    articles: 40,
    segments: 7,
    image: '/images/media-on-us/m04.jpg',
    pdf: '/media-coverage/world-cleanup-day-2022.pdf',
  },
  {
    title: 'World Cleanup Day 2023',
    articles: 13,
    segments: 7,
    image: '/images/media-on-us/m05.jpg',
    pdf: '/media-coverage/world-cleanup-day-2023.pdf',
  },
  {
    title: 'World Cleanup Day 2024',
    articles: 22,
    segments: 5,
    image: '/images/media-on-us/m06.jpg',
    pdf: '/media-coverage/world-cleanup-day-2024.pdf',
  },
  {
    title: 'World Cleanup Day 2025',
    articles: 37,
    segments: 4,
    image: '/images/media-on-us/m07.jpg',
    pdf: '/media-coverage/world-cleanup-day-2025.pdf',
  },
];
