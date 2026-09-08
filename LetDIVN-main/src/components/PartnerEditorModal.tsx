import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, CheckCircle2, AlertCircle, Save, Globe, Calendar } from 'lucide-react';
import { Partner } from '../types';
import { dbService } from '../services/dbService';
import { ImageUploadWidget } from './ImageUploadWidget';

interface PartnerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerToEdit?: Partner | null;
  onSaved?: (partner: Partner) => void;
}

export const PartnerEditorModal: React.FC<PartnerEditorModalProps> = ({
  isOpen,
  onClose,
  partnerToEdit,
  onSaved
}) => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [scale, setScale] = useState<number>(100);
  const [tier, setTier] = useState<Partner['tier']>('Gold');
  const [type, setType] = useState('Doanh Nghiệp Tiên Phong');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [joinedYear, setJoinedYear] = useState(2023);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (partnerToEdit) {
      setName(partnerToEdit.name || '');
      setLogo(partnerToEdit.logo || '');
      setScale(partnerToEdit.scale || 100);
      setTier(partnerToEdit.tier || 'Gold');
      setType(partnerToEdit.type || 'Doanh Nghiệp Tiên Phong');
      setDescription(partnerToEdit.description || '');
      setWebsite(partnerToEdit.website || '');
      setJoinedYear(partnerToEdit.joinedYear || 2023);
    } else {
      setName('');
      setLogo('https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=300&auto=format&fit=crop&q=80');
      setScale(100);
      setTier('Gold');
      setType('Doanh Nghiệp Tiên Phong');
      setDescription('');
      setWebsite('');
      setJoinedYear(new Date().getFullYear());
    }
    setError(null);
  }, [partnerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Vui lòng nhập tên đối tác hoặc tổ chức.');
      return;
    }
    if (!logo.trim()) {
      setError('Vui lòng tải lên logo đối tác.');
      return;
    }

    let saved: Partner;
    if (partnerToEdit) {
      saved = await dbService.updatePartner(partnerToEdit.id, {
        name,
        logo,
        scale: Number(scale) || 100,
        tier,
        type,
        description,
        website: website.trim() || undefined,
        joinedYear: Number(joinedYear) || 2024
      });
    } else {
      saved = await dbService.addPartner({
        name,
        logo,
        scale: Number(scale) || 100,
        tier,
        type,
        description,
        website: website.trim() || undefined,
        joinedYear: Number(joinedYear) || 2024
      });
    }

    if (onSaved) onSaved(saved);
    onClose();
  };

  if (!isOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E81A7F]/20 border border-[#E81A7F]/40 flex items-center justify-center text-[#E81A7F]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {partnerToEdit ? 'Chỉnh Sửa Đối Tác' : 'Thêm Đối Tác / Nhà Tài Trợ Mới'}
              </h3>
              <p className="text-xs text-slate-400">
                Quản lý thông tin nhà tài trợ và đối tác chiến lược
              </p>
            </div>
          </div>
          <button 
            id="close-partner-editor-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Logo Upload */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <ImageUploadWidget
              label="Logo Doanh Nghiệp / Đối Tác *"
              aspectRatioLabel="Khuyên dùng ảnh logo nền trắng/trong suốt (PNG, JPG, SVG)"
              currentImageUrl={logo}
              onImageSelected={(url) => setLogo(url)}
            />

            {/* Logo Zoom / Scale Slider */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-slate-700">🔍 Kích thước logo (Thu phóng):</span>
              <div className="flex items-center gap-2 flex-1 max-w-[240px]">
                <button
                  type="button"
                  onClick={() => setScale(prev => Math.max(50, prev - 10))}
                  className="px-2 py-1 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100 cursor-pointer"
                >
                  -
                </button>
                <input
                  type="range"
                  min="50"
                  max="180"
                  step="5"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="flex-1 accent-[#E81A7F] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setScale(prev => Math.min(180, prev + 10))}
                  className="px-2 py-1 bg-white border border-slate-300 rounded font-bold hover:bg-slate-100 cursor-pointer"
                >
                  +
                </button>
                <span className="font-mono font-bold text-[#E81A7F] w-12 text-right">{scale}%</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên Tổ Chức / Doanh Nghiệp *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Vinamilk, Unilever Vietnam, UNDP..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hạng Đối Tác (Tier)
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as Partner['tier'])}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] bg-white cursor-pointer"
              >
                <option value="Diamond">Kim Cương (Diamond)</option>
                <option value="Gold">Vàng (Gold)</option>
                <option value="Silver">Bạc (Silver)</option>
                <option value="Media">Bảo Trợ Truyền Thông (Media)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Năm Bắt Đầu Đồng Hành
              </label>
              <input
                type="number"
                min={2015}
                max={2030}
                value={joinedYear}
                onChange={(e) => setJoinedYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phân Loại Đối Tác
            </label>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="VD: Doanh Nghiệp Tiên Phong, Tổ Chức Phi Chính Phủ..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mô Tả Hợp Tác & Giá Trị Đóng Góp
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả sự hỗ trợ, tài trợ dụng cụ, vận chuyển rác tái chế..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100 resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Website Chính Thức</span>
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
            />
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
              <span>{partnerToEdit ? 'Lưu Thay Đổi' : 'Thêm Đối Tác'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  ) : null;
};


