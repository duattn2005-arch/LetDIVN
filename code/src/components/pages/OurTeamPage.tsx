import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { TeamMember } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Plus, Edit3, Trash2, ShieldCheck } from 'lucide-react';
import { TeamMemberEditorModal } from '../TeamMemberEditorModal';
import { EditableText } from '../EditableText';
import { EditableImage } from '../EditableImage';
import { TakeActionStrip } from '../TakeActionStrip';

const BRAND_PINK = '#F1138D';

export const OurTeamPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const loadTeam = () => {
    dbService.getTeam().then(setTeam);
  };

  useEffect(() => {
    loadTeam();
    const unsub = dbService.subscribe(loadTeam);
    return () => unsub();
  }, []);

  const handleAddNew = () => {
    setSelectedMember(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (member: TeamMember) => {
    setSelectedMember(member);
    setIsEditorOpen(true);
  };

  const handleDelete = (member: TeamMember) => {
    if (window.confirm(`Are you sure you want to remove "${member.name}" from the team list?`)) {
      dbService.deleteTeamMember(member.id);
      loadTeam();
    }
  };

  return (
    <div className="bg-white">

      {/* Full-width hero banner */}
      <EditableImage
        contentKey="ourTeam.heroImage"
        defaultValue="/images/our-team/hero.jpg"
        alt="People for a clean planet"
        wrapperClassName="w-full aspect-21/9 sm:h-[300px] sm:aspect-auto bg-slate-900"
        className="w-full h-full object-cover"
      />

      <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

        <div className="text-center max-w-3xl mx-auto space-y-3">
          <EditableText
            contentKey="ourTeam.title"
            defaultValue="OUR TEAM"
            as="h1"
            className="ref-heading text-3xl sm:text-4xl lg:text-[45px]"
            render={(v) => <span style={{ color: BRAND_PINK }}>{v}</span>}
          />
          <EditableText
            contentKey="ourTeam.subtitle"
            defaultValue="Meet the passionate individuals behind Let's Do It! Vietnam—a diverse team united by a common purpose: to protect our environment and inspire positive change. 🌿🌏"
            as="p"
            multiline
            className="ref-body text-sm sm:text-base text-slate-600 leading-relaxed"
          />

          {/* Admin Management Bar */}
          {isAdmin && (
            <div className="pt-2 flex items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-xs font-bold text-purple-700">
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Management Mode</span>
              </div>
              <button
                id="admin-add-team-btn"
                onClick={handleAddNew}
                className="btn-pill-3d inline-flex items-center gap-2 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs sm:text-sm px-6 py-2.5 shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Member</span>
              </button>
            </div>
          )}
        </div>

        {/* Team Grid: photo, name, role — matching the reference site's simple card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {team.map((member) => (
            <div
              key={member.id}
              className="relative group rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              {isAdmin && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-1.5 bg-white/90 hover:bg-white text-slate-700 hover:text-[#E81A7F] rounded-full shadow-md transition-colors cursor-pointer border border-slate-200"
                    title="Edit information"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
                    className="p-1.5 bg-white/90 hover:bg-white text-slate-700 hover:text-red-600 rounded-full shadow-md transition-colors cursor-pointer border border-slate-200"
                    title="Remove member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="aspect-4/3 bg-slate-100 overflow-hidden">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-4 bg-slate-50 text-center">
                <h3 className="ref-heading text-base" style={{ color: BRAND_PINK }}>
                  {member.name}
                </h3>
                <div className="text-xs font-semibold text-slate-600 mt-0.5">
                  {member.role}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      <TakeActionStrip contentKeyPrefix="ourTeam" />

      {/* Team Member Editor Modal */}
      <TeamMemberEditorModal
        isOpen={isEditorOpen}
        onClose={() => { setIsEditorOpen(false); setSelectedMember(null); }}
        memberToEdit={selectedMember}
        onSaved={() => loadTeam()}
      />
    </div>
  );
};
