import React, { useState } from 'react';
import { Calendar, MapPin, Users, ArrowRight, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';
import { FlyingBirds } from './FlyingBirds';

interface HeroSectionProps {
  onJoinEvent: () => void;
  onExploreProjects: () => void;
  onExploreMap?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onJoinEvent,
  onExploreProjects,
  onExploreMap,
}) => {
  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);
  const { t } = useLanguage();
  const [heroBadgePart1, heroBadgePart2] = t.heroSlide1Badge.split(' • ');

  return (
    <div className="relative w-full bg-slate-900 overflow-hidden select-none">

      {/* Slide 1: Grand World Cleanup Day Banner View */}
      {activeSlide === 0 && (
        <div className="relative w-full min-h-[460px] md:min-h-[520px] flex items-center justify-center bg-slate-900 text-white py-10 sm:py-14">
          
          {/* Background image & subtle gradient with ambient movement */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <EditableImage
              contentKey="hero.slide1.bgImage"
              defaultValue="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=2560&auto=format&fit=crop&q=95"
              alt="World Cleanup Day Vietnam Team Banner"
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover object-center filter brightness-95 contrast-[1.03]"
            />
            {/* Flying Birds across the entire image (top, middle, bottom) */}
            <FlyingBirds />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-black/25 pointer-events-none"></div>
          </div>


          {/* Center Banner representation matching the yellow banner in screenshot */}
          <div className="relative z-10 max-w-5xl mx-auto px-3 sm:px-4 w-full text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-yellow-400/95 backdrop-blur-md text-slate-900 px-4 sm:px-12 py-6 sm:py-8 rounded-2xl sm:rounded-3xl shadow-2xl border-2 sm:border-4 border-yellow-300 transform hover:scale-[1.01] transition-transform"
            >
              <div className="text-[11px] sm:text-sm font-extrabold uppercase tracking-widest text-slate-800 mb-1">
                Let's do it! Vietnam
              </div>
              <h1 className="text-xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase text-slate-950 leading-tight">
                <EditableText contentKey="hero.slide1.title" defaultValue={t.heroSlide1Title + ' 2026'} as="span" />
              </h1>
              <EditableText
                contentKey="hero.slide1.desc"
                defaultValue={t.heroSlide1Desc}
                as="p"
                multiline
                className="mt-2.5 sm:mt-3 text-xs sm:text-base text-slate-900 font-semibold max-w-4xl mx-auto leading-relaxed"
              />

              <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
                <button
                  id="hero-slide1-join-btn"
                  onClick={onJoinEvent}
                  className="btn-pill-3d w-full sm:w-auto bg-[#E81A7F] hover:bg-[#C9136B] text-white font-bold text-xs sm:text-sm px-7 py-2.5 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.registerNowBtn}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  id="hero-slide1-explore-btn"
                  onClick={onExploreProjects}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full shadow-md transition-all cursor-pointer text-center"
                >
                  {t.exploreCampaignsBtn}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Bottom EST 2015 & Slide Navigation */}
          <div className="absolute bottom-14 sm:bottom-2.5 inset-x-0 z-10 text-center pointer-events-none">
            <EditableText
              contentKey="hero.slide1.est"
              defaultValue="EST. 2015"
              as="div"
              className="text-xs font-bold tracking-widest text-white/80 uppercase"
            />
          </div>
        </div>
      )}

      {/* Slide 2: Pink Hero Heading: World Cleanup Day: Global Impact, Local Action */}
      {activeSlide === 1 && (
        <div className="relative w-full min-h-[520px] md:min-h-[640px] flex items-center bg-slate-950 text-white">
          
          {/* Background photograph */}
          <div className="absolute inset-0 z-0">
            <EditableImage
              contentKey="hero.slide2.bgImage"
              defaultValue="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1600&auto=format&fit=crop&q=85"
              alt="World Cleanup Day Action"
              wrapperClassName="w-full h-full"
              className="w-full h-full object-cover object-center filter brightness-40"
            />
            {/* Flying Birds across the entire image */}
            <FlyingBirds />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent pointer-events-none"></div>
          </div>

          {/* Left content block */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <EditableText
                  contentKey="hero.slide2.badge"
                  defaultValue={t.heroSlide2Badge}
                  as="span"
                  className="inline-block bg-pink-500/20 text-[#FF4D9E] border border-pink-500/30 text-xs font-extrabold uppercase px-3 py-1 rounded-full mb-4"
                />

                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
                  <EditableText contentKey="hero.slide2.title1" defaultValue={t.heroSlide2Title1} as="span" className="text-[#FF2B8F] block" />
                  <EditableText contentKey="hero.slide2.title2" defaultValue={t.heroSlide2Title2} as="span" className="text-white block mt-1.5" />
                </h1>

                <EditableText
                  contentKey="hero.slide2.desc"
                  defaultValue={t.heroSlide2Desc}
                  as="p"
                  multiline
                  className="mt-4 text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl"
                />

                {/* Key features pill list */}
                <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.featureProvinces}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.featureCert}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{t.featureGear}</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button
                    id="hero-slide2-join-btn"
                    onClick={onJoinEvent}
                    className="btn-pill-3d bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-sm sm:text-base px-8 py-3.5 shadow-xl flex items-center gap-2 cursor-pointer"
                  >
                    <span>{t.joinNextEvent}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    id="hero-slide2-about-btn"
                    onClick={onExploreProjects}
                    className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm sm:text-base px-6 py-3.5 rounded-full border border-white/20 transition-all cursor-pointer hover:scale-105"
                  >
                    {t.exploreCampaignsBtn}
                  </button>

                  {onExploreMap && (
                    <button
                      id="hero-slide2-map-btn"
                      onClick={onExploreMap}
                      className="btn-pill-3d bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-sm sm:text-base px-6 py-3.5 shadow-lg flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-emerald-200" />
                      <span>{t.navMap}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom EST. 2015 */}
          <div className="absolute bottom-14 sm:bottom-4 left-0 right-0 z-10 text-center pointer-events-none">
            <EditableText
              contentKey="hero.slide2.est"
              defaultValue="EST. 2015"
              as="div"
              className="text-xs font-bold tracking-widest text-slate-400 uppercase"
            />
          </div>
        </div>
      )}

      {/* Slide Switcher Controls at bottom */}
      <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 sm:left-auto sm:right-6 sm:translate-x-0 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-md px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/15 shadow-xl">
        <button
          onClick={() => setActiveSlide(0)}
          className={`px-3 py-1 text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
            activeSlide === 0 ? 'bg-[#E81A7F] text-white shadow-md' : 'text-slate-300 hover:text-white'
          }`}
        >
          {t.heroSlideTab1}
        </button>
        <button
          onClick={() => setActiveSlide(1)}
          className={`px-3 py-1 text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
            activeSlide === 1 ? 'bg-[#E81A7F] text-white shadow-md' : 'text-slate-300 hover:text-white'
          }`}
        >
          {t.heroSlideTab2}
        </button>
      </div>

    </div>
  );
};


