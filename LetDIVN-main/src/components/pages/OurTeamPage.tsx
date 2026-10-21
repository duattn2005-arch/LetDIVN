import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { TeamMember } from '../../types';

import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { TakeActionStrip } from '../TakeActionStrip';

const BRAND_PINK = '#F1138D';

export const OurTeamPage: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);

  const loadTeam = () => {
    dbService.getTeam().then(setTeam);
  };

  useEffect(() => {
    loadTeam();
    const unsub = dbService.subscribe(loadTeam);
    return () => unsub();
  }, []);

  return (
    <div className="bg-white">

      {/* Full-width hero banner */}
      <EditableImage
        contentKey="ourTeam.heroImage"
        defaultValue="/images/our-team/hero.jpg"
        alt="People for a clean planet"
        wrapperClassName="w-full aspect-21/9 sm:h-[484px] sm:aspect-auto bg-slate-900"
        className="w-full h-full object-cover"
      />

      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        <div className="text-center max-w-6xl mx-auto space-y-3">
          <EditableText
            contentKey="ourTeam.title"
            defaultValue="OUR TEAM"
            as="h1"
            className="ref-heading ref-title-xl"
            render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
          />
          <EditableText
            contentKey="ourTeam.subtitle"
            defaultValue="Meet the passionate individuals behind Let's Do It! Vietnam—a diverse team united by a common purpose: to protect our environment and inspire positive change. 🌿🌏"
            as="p"
            multiline
            className="ref-text max-w-[878px] mx-auto"
          />

        </div>

        {/* Team grid, as on the reference site: photo, then a light grey block
            with the name (33px pink) and role (18px grey), left-aligned. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-[1140px] mx-auto">
          {team.map((member) => (
            <div key={member.id} className="overflow-hidden">
              <div className="aspect-[560/369] bg-slate-100 overflow-hidden">
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              </div>
              <div className="px-[15px] pt-6 pb-12 text-left" style={{ backgroundColor: 'rgba(245, 245, 245, 0.97)' }}>
                <h2 className="ref-heading text-[33px] leading-[33px] pb-2.5" style={{ color: BRAND_PINK }}>
                  {member.name}
                </h2>
                <h4 className="ref-body text-lg leading-[18px] font-medium" style={{ color: '#54595F' }}>
                  {member.role}
                </h4>
              </div>
            </div>
          ))}
        </div>

      </div>

      <TakeActionStrip contentKeyPrefix="ourTeam" />
    </div>
  );
};
