import React from 'react';
import { EditableText } from '../EditableText';

// The row of four boxes over the footer of letsdoitvietnam.org's homepage:
// white cards with a pink Font Awesome icon (the plugin's footer.css).
const BOXES = [
  { key: 'card1', title: 'WORLD CLEANUP DAY', desc: 'Create a positive impact on the environment by mobilizing millions of volunteers in Vietnam.', vb: '0 0 640 512',
    d: 'M256.47 216.77l86.73 109.18s-16.6 102.36-76.57 150.12C206.66 523.85 0 510.19 0 510.19s3.8-23.14 11-55.43l94.62-112.17c3.97-4.7-.87-11.62-6.65-9.5l-60.4 22.09c14.44-41.66 32.72-80.04 54.6-97.47 59.97-47.76 163.3-40.94 163.3-40.94zM636.53 31.03l-19.86-25c-5.49-6.9-15.52-8.05-22.41-2.56l-232.48 177.8-34.14-42.97c-5.09-6.41-15.14-5.21-18.59 2.21l-25.33 54.55 86.73 109.18 58.8-12.45c8-1.69 11.42-11.2 6.34-17.6l-34.09-42.92 232.48-177.8c6.89-5.48 8.04-15.53 2.55-22.44z' },
  { key: 'card2', title: 'ENVIRONMENTAL AWARENESS', desc: 'Empower individuals to make informed choices and take action for a greener planet', vb: '0 0 576 512',
    d: 'M542.22 32.05c-54.8 3.11-163.72 14.43-230.96 55.59-4.64 2.84-7.27 7.89-7.27 13.17v363.87c0 11.55 12.63 18.85 23.28 13.49 69.18-34.82 169.23-44.32 218.7-46.92 16.89-.89 30.02-14.43 30.02-30.66V62.75c.01-17.71-15.35-31.74-33.77-30.7zM264.73 87.64C197.5 46.48 88.58 35.17 33.78 32.05 15.36 31.01 0 45.04 0 62.75V400.6c0 16.24 13.13 29.78 30.02 30.66 49.49 2.6 149.59 12.11 218.77 46.95 10.62 5.35 23.21-1.94 23.21-13.46V100.63c0-5.29-2.62-10.14-7.27-12.99z' },
  { key: 'card3', title: 'COMMUNITY ENGAGEMENT', desc: 'Drive meaningful change and inspire others to join the cause.', vb: '0 0 640 512',
    d: 'M128 96c26.5 0 48-21.5 48-48S154.5 0 128 0 80 21.5 80 48s21.5 48 48 48zm384 0c26.5 0 48-21.5 48-48S538.5 0 512 0s-48 21.5-48 48 21.5 48 48 48zm125.7 372.1l-44-110-41.1 46.4-2 18.2 27.7 69.2c5 12.5 17 20.1 29.7 20.1 4 0 8-.7 11.9-2.3 16.4-6.6 24.4-25.2 17.8-41.6zm-34.2-209.8L585 178.1c-4.6-20-18.6-36.8-37.5-44.9-18.5-8-39-6.7-56.1 3.3-22.7 13.4-39.7 34.5-48.1 59.4L432 229.8 416 240v-96c0-8.8-7.2-16-16-16H240c-8.8 0-16 7.2-16 16v96l-16.1-10.2-11.3-33.9c-8.3-25-25.4-46-48.1-59.4-17.2-10-37.6-11.3-56.1-3.3-18.9 8.1-32.9 24.9-37.5 44.9l-18.4 80.2c-4.6 20 .7 41.2 14.4 56.7l67.2 75.9 10.1 92.6C130 499.8 143.8 512 160 512c1.2 0 2.3-.1 3.5-.2 17.6-1.9 30.2-17.7 28.3-35.3l-10.1-92.8c-1.5-13-6.9-25.1-15.6-35l-43.3-49 17.6-70.3 6.8 20.4c4.1 12.5 11.9 23.4 24.5 32.6l51.1 32.5c4.6 2.9 12.1 4.6 17.2 5h160c5.1-.4 12.6-2.1 17.2-5l51.1-32.5c12.6-9.2 20.4-20 24.5-32.6l6.8-20.4 17.6 70.3-43.3 49c-8.7 9.9-14.1 22-15.6 35l-10.1 92.8c-1.9 17.6 10.8 33.4 28.3 35.3 1.2.1 2.3.2 3.5.2 16.1 0 30-12.1 31.8-28.5l10.1-92.6 67.2-75.9c13.6-15.5 19-36.7 14.4-56.7zM46.3 358.1l-44 110c-6.6 16.4 1.4 35 17.8 41.6 16.8 6.6 35.1-1.7 41.6-17.8l27.7-69.2-2-18.2-41.1-46.4z' },
  { key: 'card4', title: 'SUSTAINABLE LIFESTYLE', desc: 'Emphasizing responsible consumption, waste reduction, and eco-friendly choices', vb: '0 0 576 512',
    d: 'M546.2 9.7c-5.6-12.5-21.6-13-28.3-1.2C486.9 62.4 431.4 96 368 96h-80C182 96 96 182 96 288c0 7 .8 13.7 1.5 20.5C161.3 262.8 253.4 224 384 224c8.8 0 16 7.2 16 16s-7.2 16-16 16C132.6 256 26 410.1 2.4 468c-6.6 16.3 1.2 34.9 17.5 41.6 16.4 6.8 35-1.1 41.8-17.3 1.5-3.6 20.9-47.9 71.9-90.6 32.4 43.9 94 85.8 174.9 77.2C465.5 467.5 576 326.7 576 154.3c0-50.2-10.8-102.2-29.8-144.6z' },
];

export const HomeFeatures: React.FC = () => (
  <section className="grid grid-cols-1 min-[601px]:grid-cols-2 lg:grid-cols-4 gap-5 pt-4 pb-10 px-[clamp(16px,2.5vw,48px)] mt-[50px] font-['Poppins']">
    {BOXES.map((b) => (
      <div
        key={b.key}
        className="flex items-start gap-4 p-6 rounded-[20px] bg-white border border-[rgba(28,36,75,0.06)] shadow-[0_10px_28px_-14px_rgba(28,36,75,0.18)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_-16px_rgba(241,19,141,0.3)]"
      >
        <span className="flex items-center justify-center w-[46px] h-[46px] shrink-0 rounded-[14px] bg-[#fdeaf4] text-[22px]">
          <svg viewBox={b.vb} className="w-[1em] h-[1em]" fill="#f1138d" aria-hidden="true"><path d={b.d} /></svg>
        </span>
        <div>
          <EditableText
            contentKey={`home.${b.key}Title`}
            defaultValue={b.title}
            as="h3"
            className="m-0 mb-1.5 text-[#1c244b] text-[15px] font-semibold leading-[1.35] tracking-[0.02em]"
          />
          <EditableText
            contentKey={`home.${b.key}Desc`}
            defaultValue={b.desc}
            as="p"
            multiline
            className="m-0 text-[#64748b] text-[13.5px] leading-[1.6]"
          />
        </div>
      </div>
    ))}
  </section>
);
