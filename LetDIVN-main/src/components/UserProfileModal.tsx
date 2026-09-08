import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  LogOut, 
  Save, 
  Download,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/dbService';
import { VolunteerRegistration } from '../types';
import { ImageUploadWidget } from './ImageUploadWidget';
import confetti from 'canvas-confetti';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, logout, switchRole } = useAuth();
  const isAllowedAdminEmail = (_email?: string | null) => !!(user as any)?.isEligibleForAdmin;
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Hà Nội');
  const [avatar, setAvatar] = useState('');
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [myRegistrations, setMyRegistrations] = useState<VolunteerRegistration[]>([]);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setCity(user.city || 'Hà Nội');
      setAvatar(user.avatar || '');

      dbService.getVolunteers().then((allVolunteers) => {
        const userRegs = allVolunteers.filter(
          v => (user.email && v.email.toLowerCase() === user.email.toLowerCase()) ||
               (user.phone && v.phone === user.phone) ||
               (v.fullName.toLowerCase() === user.name.toLowerCase())
        );
        setMyRegistrations(userRegs);
      });
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      alert('Số điện thoại phải có đúng 10 chữ số (VD: 0987654321)!');
      return;
    }
    updateProfile({
      name,
      email,
      phone: cleanPhone,
      city,
      avatar
    });
    try {
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.7 } });
    } catch {}
    setSuccessMsg('✓ Đã lưu thay đổi hồ sơ thành công!');
    setTimeout(() => setSuccessMsg(null), 4000);
    setIsEditingAvatar(false);
  };

  const handleDownloadCertificate = () => {
    alert(`Chứng nhận Tình nguyện viên Let's Do It Vietnam - Cấp cho: ${user.name}\nCảm ơn bạn đã đóng góp cho môi trường!`);
  };

  if (!isOpen || !user) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="relative bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with profile banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#E81A7F] to-[#E81A7F] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative group">
              <img
                src={avatar || user.avatar}
                alt={user.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white/80 shadow-lg bg-slate-800"
              />
              <button
                type="button"
                onClick={() => setIsEditingAvatar(!isEditingAvatar)}
                className="absolute bottom-0 right-0 p-1.5 bg-slate-900 hover:bg-black text-white rounded-full border-2 border-white shadow cursor-pointer"
                title="Thay đổi ảnh đại diện cá nhân"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-xl sm:text-2xl font-black">{user.name}</h3>
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                  user.role === 'admin' 
                    ? 'bg-purple-900 text-purple-200 border border-purple-400' 
                    : 'bg-emerald-900 text-emerald-200 border border-emerald-400'
                }`}>
                  {user.role === 'admin' ? '🛡️ Tài Khoản Quản Trị (Admin)' : '🌱 Tài Khoản Cá Nhân (Tình Nguyện Viên)'}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1">
                Đăng nhập bằng: <strong>{user.provider.toUpperCase()}</strong> • Tham gia từ: {user.joinedAt}
              </p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Avatar Upload Dropdown / Box */}
          {isEditingAvatar && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold">Cập nhật ảnh đại diện cá nhân</span>
                <button 
                  onClick={() => setIsEditingAvatar(false)} 
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  Đóng
                </button>
              </div>
              <ImageUploadWidget
                currentImageUrl={avatar}
                onImageSelected={(val) => {
                  setAvatar(val);
                }}
                label="Chọn ảnh chân dung của bạn"
                aspectRatioLabel="Tỉ lệ 1:1 vuông hoặc 4:3"
              />
            </div>
          )}

          {/* Personal Impact Stats */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Chiến dịch tham gia</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                {user.eventsAttended || (myRegistrations.length > 0 ? myRegistrations.length : 2)}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Hạng huy hiệu</span>
              <div className="text-xl sm:text-2xl font-black text-amber-500 mt-1">
                Gold ★
              </div>
            </div>
          </div>

          {/* Personal Info Edit Form */}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#E81A7F]" />
              <span>Thông tin hồ sơ cá nhân</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Địa chỉ Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Số điện thoại liên hệ (Đúng 10 số)
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${phone.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {phone.length}/10 số
                  </span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  minLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="VD: 0987654321"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tỉnh / Thành phố sinh sống
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F]"
                >
                  <optgroup label="Thành phố trực thuộc Trung ương">
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Huế">Huế</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                  </optgroup>
                  <optgroup label="Tỉnh">
                    <option value="An Giang">An Giang</option>
                    <option value="Bắc Ninh">Bắc Ninh</option>
                    <option value="Cà Mau">Cà Mau</option>
                    <option value="Cao Bằng">Cao Bằng</option>
                    <option value="Đắk Lắk">Đắk Lắk</option>
                    <option value="Điện Biên">Điện Biên</option>
                    <option value="Đồng Nai">Đồng Nai</option>
                    <option value="Đồng Tháp">Đồng Tháp</option>
                    <option value="Gia Lai">Gia Lai</option>
                    <option value="Hà Tĩnh">Hà Tĩnh</option>
                    <option value="Hưng Yên">Hưng Yên</option>
                    <option value="Khánh Hòa">Khánh Hòa</option>
                    <option value="Lai Châu">Lai Châu</option>
                    <option value="Lâm Đồng">Lâm Đồng</option>
                    <option value="Lạng Sơn">Lạng Sơn</option>
                    <option value="Lào Cai">Lào Cai</option>
                    <option value="Nghệ An">Nghệ An</option>
                    <option value="Ninh Bình">Ninh Bình</option>
                    <option value="Phú Thọ">Phú Thọ</option>
                    <option value="Quảng Ngãi">Quảng Ngãi</option>
                    <option value="Quảng Ninh">Quảng Ninh</option>
                    <option value="Quảng Trị">Quảng Trị</option>
                    <option value="Sơn La">Sơn La</option>
                    <option value="Tây Ninh">Tây Ninh</option>
                    <option value="Thái Nguyên">Thái Nguyên</option>
                    <option value="Thanh Hóa">Thanh Hóa</option>
                    <option value="Tuyên Quang">Tuyên Quang</option>
                    <option value="Vĩnh Long">Vĩnh Long</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 gap-3 flex-wrap">
              {successMsg ? (
                <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold shadow-xs animate-in fade-in zoom-in-95">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#E81A7F] hover:bg-[#D01370] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Thay Đổi</span>
              </button>
            </div>
          </form>

          {/* Registered Campaigns History */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#E81A7F]" />
              <span>Chiến dịch đã đăng ký tham gia ({myRegistrations.length})</span>
            </h4>

            {myRegistrations.length === 0 ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center text-xs text-slate-500">
                Bạn chưa đăng ký chiến dịch nào. Hãy nhấn nút Đăng ký TNV trên trang chủ để tham gia cùng chúng tôi!
              </div>
            ) : (
              <div className="space-y-2">
                {myRegistrations.map((reg) => (
                  <div 
                    key={reg.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{reg.eventName}</div>
                      <div className="text-slate-500">Địa điểm: {reg.city} • Size áo: {reg.tshirtSize}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      reg.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Role Switching & Logout */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            {isAllowedAdminEmail(user.email) && (
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Chuyển đổi chế độ xem:</div>
                <div className="text-[11px] text-slate-500">Xem giao diện dưới quyền Admin hoặc Tình nguyện viên</div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {isAllowedAdminEmail(user.email) && (
                <button
                  type="button"
                  onClick={() => switchRole(user.role === 'admin' ? 'volunteer' : 'admin')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold hover:text-[#E81A7F] transition-colors cursor-pointer"
                >
                  Chuyển sang: {user.role === 'admin' ? 'Tài Khoản Cá Nhân' : 'Tài Khoản Admin'}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  ) : null;
};


