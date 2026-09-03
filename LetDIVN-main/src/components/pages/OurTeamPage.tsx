import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { TeamMember } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Edit3, Trash2, ShieldCheck } from 'lucide-react';
import { TeamMemberEditorModal } from '../TeamMemberEditorModal';
import { EditableText } from '../EditableText';
import { TiltCard } from '../TiltCard';

export const OurTeamPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();
  // Brand name stays fixed (never admin-editable), but its position in the
  // sentence differs per language — same split pattern as AboutSection/WhoWeArePage.
  const [ourTeamTitleBefore, ourTeamTitleAfter] = t.ourTeamTitle.split("Let's do it! Vietnam");
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
    if (window.confirm(`Bạn có chắc chắn muốn xóa thành viên "${member.name}" khỏi danh sách đội ngũ?`)) {
      dbService.deleteTeamMember(member.id);
      loadTeam();
    }
  };

  return (
    <div className="py-10 sm:py-14 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <EditableText
            contentKey="ourTeam.title"
            defaultValue={t.ourTeamTitle || "Đội Ngũ Let's do it! Vietnam"}
            as="h1"
            className="text-2xl sm:text-3xl lg:text-4xl font-black metallic-title tracking-tight leading-tight [text-wrap:balance]"
          />
          <EditableText
            contentKey="ourTeam.subtitle"
            defaultValue={t.ourTeamDesc}
            as="p"
            multiline
            className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto [text-wrap:balance]"
          />

          {/* Admin Management Bar */}
          {isAdmin && (
            <div className="pt-2 flex items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-xs font-bold text-purple-700">
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'vi' ? 'Chế độ Quản trị viên (Admin)' : 'Admin Management Mode'}</span>
              </div>
              <button
                id="admin-add-team-btn"
                onClick={handleAddNew}
                className="btn-pill-3d inline-flex items-center gap-2 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs sm:text-sm px-6 py-2.5 shadow-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'vi' ? 'Thêm Thành Viên Mới' : 'Add New Member'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Team Grid with 3D TiltCards — flex+justify-center (not a CSS grid) so a
            partial last row (e.g. just 2 members) stays centered instead of
            sticking to the left with dead space on the right. */}
        <div className="flex flex-wrap justify-center gap-5 sm:gap-6">
          {team.map((member) => (
            <TiltCard
              key={member.id}
              className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] p-6 border border-white/80 shadow-md hover:shadow-2xl flex flex-col items-center text-center relative group"
            >
              {/* Admin quick actions overlay buttons */}
              {isAdmin && (
                <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-1.5 bg-white/90 hover:bg-white text-slate-700 hover:text-[#E81A7F] rounded-full shadow-md transition-colors cursor-pointer border border-slate-200"
                    title="Chỉnh sửa thông tin"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(member)}
                    className="p-1.5 bg-white/90 hover:bg-white text-slate-700 hover:text-red-600 rounded-full shadow-md transition-colors cursor-pointer border border-slate-200"
                    title="Xóa thành viên"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Avatar with smooth 3D halo */}
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden mb-4 border-4 border-white shadow-xl bg-slate-100 group-hover:scale-105 transition-transform duration-500">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Department Tag */}
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#E81A7F] bg-pink-50 border border-pink-100 px-3 py-0.5 rounded-full mb-2">
                {member.department}
              </span>

              {/* Name */}
              <h3 className="text-base sm:text-lg font-black text-slate-900 line-clamp-1 mb-1">
                {member.name}
              </h3>

              {/* Role */}
              <div className="text-xs font-bold text-slate-700 line-clamp-1 mb-3">
                {member.role}
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-5 flex-grow">
                {member.bio}
              </p>

              {/* Admin direct edit trigger */}
              {isAdmin && (
                <div className="w-full pt-3 mt-2 border-t border-dashed border-slate-200">
                  <button
                    onClick={() => handleEdit(member)}
                    className="w-full py-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa & Cập Nhật Ảnh</span>
                  </button>
                </div>
              )}
            </TiltCard>
          ))}
        </div>

        {/* Join the core team callout */}
        <div className="bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200 text-center space-y-4 max-w-3xl mx-auto">
          <EditableText contentKey="ourTeam.joinTitle" defaultValue={t.ourTeamJoinTitle} as="h3" className="text-2xl font-bold text-slate-900" />
          <EditableText
            contentKey="ourTeam.joinDesc"
            defaultValue={t.ourTeamJoinDesc}
            as="p"
            multiline
            className="text-sm text-slate-600 leading-relaxed"
          />
          <a
            href="mailto:hr@letsdoitvietnam.org"
            className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm px-8 py-3 rounded-full shadow-md transition-all"
          >
            <EditableText contentKey="ourTeam.joinBtn" defaultValue={t.ourTeamJoinBtn} as="span" />
          </a>
        </div>

      </div>

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


