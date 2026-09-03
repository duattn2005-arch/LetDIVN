import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2, CheckCircle2, Sparkles, Send } from 'lucide-react';
import { dbService } from '../services/dbService';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({ isOpen, onClose }) => {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<'Corporate' | 'NGO' | 'Government' | 'University' | 'Media'>('Corporate');
  const [partnershipType, setPartnershipType] = useState('Tài trợ tài chính & trang thiết bị');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.addPartner({
      name: companyName,
      tier: 'Silver',
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&auto=format&fit=crop&q=80',
      website: 'https://example.com',
      type: type,
      description: `${partnershipType} - Đại diện: ${contactPerson} (${phone})`,
      joinedYear: new Date().getFullYear(),
      contactPerson,
      email,
      phone
    });
    setSubmitted(true);
  };

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-[#E81A7F] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Building2 className="w-3.5 h-3.5" />
            <span>Hợp Tác Chiến Lược & ESG</span>
          </div>
          <h3 className="text-2xl font-black">Đăng Ký Trở Thành Đối Tác</h3>
          <p className="text-xs text-white/90 mt-1">Đồng hành cùng Let's do it! Vietnam xây dựng tương lai bền vững</p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-slate-900">Tiếp Nhận Đề Xuất!</h4>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Cảm ơn <strong>{companyName}</strong> đã gửi đề xuất hợp tác. Ban Đối ngoại & ESG của Let's do it! Vietnam sẽ liên hệ lại với đại diện {contactPerson} trong vòng 24 giờ.
            </p>
            <button
              onClick={() => { setSubmitted(false); onClose(); }}
              className="bg-[#E81A7F] text-white font-bold text-sm px-8 py-3 rounded-full hover:bg-[#D01370]"
            >
              Xác nhận & Đóng
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên Tổ Chức / Doanh Nghiệp *</label>
              <input
                type="text"
                required
                placeholder="Tập đoàn / Công ty / Trường Đại Học..."
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Người Đại Diện Liên Hệ *</label>
                <input
                  type="text"
                  required
                  placeholder="Họ và tên"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại *</label>
                <input
                  type="tel"
                  required
                  placeholder="0987 654 321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Công Việc *</label>
                <input
                  type="email"
                  required
                  placeholder="partner@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Loại Hình Tổ Chức</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                >
                  <option value="Corporate">Doanh nghiệp / Tập đoàn (Corporate)</option>
                  <option value="NGO">Tổ chức Phi Chính Phủ (NGO)</option>
                  <option value="University">Trường Đại Học / Viện Nghiên Cứu</option>
                  <option value="Government">Cơ quan Nhà nước</option>
                  <option value="Media">Báo chí & Cơ quan Truyền thông</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hình Thức Đề Xuất Hợp Tác</label>
              <input
                type="text"
                placeholder="VD: Tài trợ 100 triệu mua găng tay tái sử dụng, đồng tổ chức dọn rác bãi biển..."
                value={partnershipType}
                onChange={(e) => setPartnershipType(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-sm py-3.5 rounded-full shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Gửi Đề Xuất Hợp Tác</span>
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  ) : null;
};


