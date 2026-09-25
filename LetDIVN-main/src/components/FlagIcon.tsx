import React from 'react';
import { Language } from '../context/LanguageContext';

interface FlagIconProps {
  lang: Language | string;
  className?: string;
}

export const FlagIcon: React.FC<FlagIconProps> = ({ lang, className = 'w-5 h-3.5' }) => {
  switch (lang) {
    case 'vi':
      return (
        <svg viewBox="0 0 30 20" className={`inline-block rounded-xs shadow-xs shrink-0 object-cover ${className}`}>
          <rect width="30" height="20" fill="#DA251D" />
          <polygon
            fill="#FFFF00"
            points="15,4 16.54,8.76 21.54,8.76 17.5,11.7 19.04,16.46 15,13.52 10.96,16.46 12.5,11.7 8.46,8.76 13.46,8.76"
          />
        </svg>
      );
    case 'en':
      return (
        <svg viewBox="0 0 60 30" className={`inline-block rounded-xs shadow-xs shrink-0 object-cover ${className}`}>
          <clipPath id="t">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
          </clipPath>
          <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
        </svg>
      );
    case 'fr':
      return (
        <svg viewBox="0 0 30 20" className={`inline-block rounded-xs shadow-xs shrink-0 object-cover ${className}`}>
          <rect width="10" height="20" fill="#002395" />
          <rect x="10" width="10" height="20" fill="#FFFFFF" />
          <rect x="20" width="10" height="20" fill="#ED2939" />
        </svg>
      );
    case 'ja':
      return (
        <svg viewBox="0 0 30 20" className={`inline-block rounded-xs shadow-xs shrink-0 object-cover border border-slate-200 ${className}`}>
          <rect width="30" height="20" fill="#FFFFFF" />
          <circle cx="15" cy="10" r="6" fill="#BC002D" />
        </svg>
      );
    case 'ko':
      return (
        <svg viewBox="0 0 30 20" className={`inline-block rounded-xs shadow-xs shrink-0 object-cover border border-slate-200 ${className}`}>
          <rect width="30" height="20" fill="#FFFFFF" />
          <circle cx="15" cy="10" r="5" fill="#CD2E3A" />
          <path d="M10,10 A5,5 0 0,0 20,10 A2.5,2.5 0 0,0 15,10 A2.5,2.5 0 0,1 10,10 Z" fill="#0047A0" />
        </svg>
      );
    case 'zh':
      return (
        <svg viewBox="0 0 30 20" className={`inline-block rounded-xs shadow-xs shrink-0 object-cover ${className}`}>
          <rect width="30" height="20" fill="#EE1C25" />
          <polygon fill="#FFFF00" points="5,2 6.5,6.5 11,6.5 7.5,9 9,13.5 5,10.5 1,13.5 2.5,9 -1,6.5 3.5,6.5" transform="scale(0.5) translate(2,2)" />
        </svg>
      );
    case 'de':
      return (
        <svg viewBox="0 0 30 20" className={`inline-block rounded-xs shadow-xs shrink-0 object-cover ${className}`}>
          <rect width="30" height="6.66" fill="#000000" />
          <rect y="6.66" width="30" height="6.66" fill="#DD0000" />
          <rect y="13.32" width="30" height="6.68" fill="#FFCE00" />
        </svg>
      );
    case 'es':
      return (
        <svg viewBox="0 0 30 20" className={`inline-block rounded-xs shadow-xs shrink-0 object-cover ${className}`}>
          <rect width="30" height="5" fill="#AA151B" />
          <rect y="5" width="30" height="10" fill="#F1BF00" />
          <rect y="15" width="30" height="5" fill="#AA151B" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 30 20" className={`inline-block rounded-xs shadow-xs shrink-0 object-cover ${className}`}>
          <rect width="30" height="20" fill="#DA251D" />
          <polygon
            fill="#FFFF00"
            points="15,4 16.54,8.76 21.54,8.76 17.5,11.7 19.04,16.46 15,13.52 10.96,16.46 12.5,11.7 8.46,8.76 13.46,8.76"
          />
        </svg>
      );
  }
};


