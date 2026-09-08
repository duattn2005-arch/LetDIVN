import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, User, CheckCircle2, AlertCircle, Save, Briefcase, Mail, Linkedin, Facebook } from 'lucide-react';
import { TeamMember } from '../types';
import { dbService } from '../services/dbService';
import { ImageUploadWidget } from './ImageUploadWidget';

interface TeamMemberEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: TeamMember | null;
  onSaved?: (member: TeamMember) => void;
}

export const TeamMemberEditorModal: React.FC<TeamMemberEditorModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  onSaved
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('Ban Điều Hành');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [facebook, setFacebook] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name || '');
      setRole(memberToEdit.role || '');
      setDepartment(memberToEdit.department || 'Ban Điều Hành');
      setAvatar(memberToEdit.avatar || '');
      setBio(memberToEdit.bio || '');
      setLinkedin(memberToEdit.linkedin || '');
      setFacebook(memberToEdit.facebook || '');
      setEmail(memberToEdit.email || '');
    } else {
      setName('');
      setRole('');
      setDepartment('Ban Điều Hành');
      setAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80');
      setBio('');
      setLinkedin('');
      setFacebook('');
      setEmail('');
    }
    setError(null);
  }, [memberToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập họ và tên thành viên.');
      return;
    }
    if (!role.trim()) {
      setError('Vui lòng nhập chức danh / vai trò.');
      return;
    }
    if (!avatar.trim()) {
      setError('Vui lòng tải lên ảnh đại diện cho thành viên.');
      return;
    }

    let saved: TeamMember;
    if (memberToEdit) {
      saved = await dbService.updateTeamMember(memberToEdit.id, {
        name,
        role,
        department,
        avatar,
        bio,
        linkedin: linkedin.trim() || undefined,
        facebook: facebook.trim() || undefined,
        email: email.trim() || undefined
      });
    } else {
      saved = await dbService.addTeamMember({
        name,
        role,
        department,
        avatar,
        bio,
        linkedin: linkedin.trim() || undefined,
        facebook: facebook.trim() || undefined,
        email: email.trim() || undefined
      });
    }

    if (onSaved) onSaved(saved);
    onClose();
  };

  if (!isOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E81A7F]/20 border border-[#E81A7F]/40 flex items-center justify-center text-[#E81A7F]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {memberToEdit ? 'Chỉnh Sửa Thông Tin Thành Viên' : 'Thêm Thành Viên Mới'}
              </h3>
              <p className="text-xs text-slate-400">
                Cập nhật hồ sơ nhân sự đội ngũ Let's do it! Vietnam
              </p>
            </div>
          </div>
          <button 
            id="close-team-editor-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Avatar Upload */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <ImageUploadWidget
              label="Ảnh Chân Dung / Đại Diện Thành Viên *"
              aspectRatioLabel="Khuyên dùng ảnh vuông 1:1 rõ mặt (PNG, JPG)"
              currentImageUrl={avatar}
              onImageSelected={(url) => setAvatar(url)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và Tên *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Nguyễn Thị Lan Anh"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Chức Danh / Vị Trí *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="VD: Trưởng Ban Điều Phối Miền Bắc"
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phòng Ban / Khối
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] bg-white cursor-pointer"
            >
              <option value="Ban Điều Hành">Ban Điều Hành</option>
              <option value="Ban Truyền Thông & Sự Kiện">Ban Truyền Thông & Sự Kiện</option>
              <option value="Ban Đối Ngoại & Tài Trợ">Ban Đối Ngoại & Tài Trợ</option>
              <option value="Ban Hậu Cần & Điều Phối Rác Thải">Ban Hậu Cần & Điều Phối Rác Thải</option>
              <option value="Điều Phối Viên Tỉnh / Thành">Điều Phối Viên Tỉnh / Thành</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tiểu Sử / Giới Thiệu Ngắn (Bio)
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Giới thiệu kinh nghiệm, niềm đam mê vì môi trường..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100 resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                <span>LinkedIn</span>
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Facebook className="w-3.5 h-3.5 text-[#1877F2]" />
                <span>Facebook</span>
              </label>
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#E81A7F]" />
                <span>Email Liên Hệ</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@letsdoitvietnam.org"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{memberToEdit ? 'Lưu Thay Đổi' : 'Thêm Thành Viên'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
};


