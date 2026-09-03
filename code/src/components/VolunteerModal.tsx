import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles, Send, AlertCircle } from 'lucide-react';
import { dbService } from '../services/dbService';
import { CleanupEvent } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveToGoogleSheet, getGoogleAppsScriptUrl } from '../services/googleSheetsService';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEventId?: string;
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedEventId 
}) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CleanupEvent[]>([]);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    dbService.getEvents().then(setEvents);
  }, []);

  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone ? user.phone.replace(/\D/g, '').slice(0, 10) : '');
  const [address, setAddress] = useState(user?.city || 'Hà Nội');
  const [eventId, setEventId] = useState(selectedEventId || events[0]?.id || '');
  const [birthYear, setBirthYear] = useState<string>('2004');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Hậu cần & Phân loại rác']);
  const [customRole, setCustomRole] = useState('');
  const [notes, setNotes] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Calculate age automatically from birth year
  const yearNumber = parseInt(birthYear, 10);
  const calculatedAge = (!isNaN(yearNumber) && yearNumber >= 1920 && yearNumber <= currentYear) 
    ? (currentYear - yearNumber) 
    : null;

  const resetFormState = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setBirthYear('2004');
    setSelectedSkills([]);
    setCustomRole('');
    setNotes('');
    setPhoneError(null);
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (selectedEventId) {
        setEventId(selectedEventId);
      } else if (events.length > 0) {
        setEventId(events[0].id);
      }
      if (user) {
        setFullName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone ? user.phone.replace(/\D/g, '').slice(0, 10) : '');
        setAddress(user.city || 'Hà Nội');
      } else {
        resetFormState();
      }
      setPhoneError(null);
    }
  }, [isOpen, selectedEventId, user, events]);

  if (!isOpen) return null;

  const skillOptions = [
    'Hậu cần & Phân loại rác',
    'Nhiếp ảnh & Quay phim truyền thông',
    'Điều phối & Quản lý nhóm',
    'Sơ cấp cứu & Y tế',
    'Lái xe & Vận chuyển rác',
    'Phiên dịch Tiếng Anh',
    'Hoạt náo & Hướng dẫn viên sinh thái'
  ];

  const handleSkillToggle = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);

    if (digitsOnly.length > 0 && digitsOnly.length < 10) {
      setPhoneError(`Số điện thoại phải có đúng 10 số (hiện có ${digitsOnly.length}/10 số)`);
    } else {
      setPhoneError(null);
    }
  };

  const handleBirthYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    setBirthYear(digits);
  };

  const handleCloseModal = () => {
    resetFormState();
    onClose();
  };

  /**
   * Xử lý Submit Form:
   * 1. Gom toàn bộ dữ liệu vào formData.
   * 2. Gọi saveToGoogleSheet(formData) ngầm độc lập (KHÔNG DÙNG await).
   * 3. Ngay lập tức gọi onClose() để đóng popup và reset toàn bộ state form về rỗng.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Kiểm tra ràng buộc số điện thoại (chính xác 10 số)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setPhoneError('Số điện thoại phải có đúng 10 chữ số (không được ít hơn hoặc nhiều hơn)!');
      alert('⚠ Số điện thoại không hợp lệ!\nVui lòng nhập đúng 10 chữ số (VD: 0987654321).');
      return;
    }

    // 2. Kiểm tra năm sinh
    if (calculatedAge === null || calculatedAge < 6 || calculatedAge > 105) {
      alert(`⚠ Năm sinh không hợp lệ!\nVui lòng nhập năm sinh từ 1920 đến ${currentYear - 6}.`);
      return;
    }

    const eventObj = events.find(ev => ev.id === eventId);
    const finalSkills = [...selectedSkills];
    if (customRole.trim()) {
      finalSkills.push(customRole.trim());
    }

    const eventTitle = eventObj ? eventObj.title : 'World Cleanup Day 2026';
    const ageVal = calculatedAge !== null ? String(calculatedAge) : (birthYear || '22');

    // Gom toàn bộ dữ liệu từ các ô nhập liệu
    const formData = {
      name: fullName.trim(),
      phone: cleanPhone,
      email: email.trim(),
      city: address.trim() || 'Việt Nam',
      age: ageVal,
      project: eventTitle,
      skills: finalSkills
    };

    // Lưu vào CSDL nội bộ
    dbService.addVolunteer({
      fullName: formData.name,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      eventId,
      eventName: formData.project,
      ageGroup: `${birthYear} (${ageVal} tuổi)`,
      tshirtSize: 'L',
      emergencyContact: formData.phone,
      skills: finalSkills,
      status: 'Approved',
      notes: notes.trim()
    });

    // Lấy URL cấu hình Google Sheet Web App
    const eventSheetUrl = eventObj?.sheetUrl || '';
    const globalUrl = getGoogleAppsScriptUrl();
    const effectiveUrl = eventSheetUrl || globalUrl;

    // GỌI HÀM LƯU GOOGLE SHEET CHẠY NGẦM ĐỘC LẬP (KHÔNG DÙNG await ĐỂ TRÁNH NGHẼN CORS MẠNG)
    saveToGoogleSheet(formData, effectiveUrl).catch((err) => {
      console.warn('Silent sheet sync:', err);
    });

    // LẬP TỨC ĐÓNG POPUP FORM VÀ RESET TOÀN BỘ Ô NHẬP LIỆU VỀ RỖNG
    onClose();
    resetFormState();
  };

  if (!isOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#E81A7F] p-4 sm:p-5 text-white text-center relative shrink-0">
          <button
            onClick={handleCloseModal}
            className="absolute top-3.5 right-3.5 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-0.5 rounded-full text-[11px] font-bold mb-1 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Mạng Lưới Tình Nguyện Viên Toàn Quốc</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black">Đăng Ký Tham Gia Dự Án</h3>
          <p className="text-[11px] text-white/90">Thông tin sẽ tự động đồng bộ lên Google Sheets quản trị của Admin</p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 scrollbar-thin p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Event selection */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                1. Chọn Dự Án / Chiến Dịch Tham Gia *
              </label>
              <select
                required
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:border-[#E81A7F]"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.city} - {evt.date})
                  </option>
                ))}
              </select>
            </div>

            {/* Personal Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Họ và Tên *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Nguyễn Văn An"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Số Điện Thoại (Đúng 10 số) *</label>
                  <span className={`text-[10px] font-mono font-bold ${phone.length === 10 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {phone.length}/10 số
                  </span>
                </div>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  minLength={10}
                  placeholder="VD: 0987654321"
                  value={phone}
                  onChange={handlePhoneChange}
                  className={`w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm font-mono focus:outline-hidden transition-colors ${
                    phoneError 
                      ? 'border-red-400 bg-red-50/50 text-red-900 focus:border-red-500' 
                      : phone.length === 10
                      ? 'border-emerald-500 bg-emerald-50/30 text-emerald-900 focus:border-emerald-600 font-bold'
                      : 'border-slate-300 focus:border-[#E81A7F]'
                  }`}
                />
                {phoneError && (
                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Địa Chỉ Email *</label>
                <input
                  type="email"
                  required
                  placeholder="ban.letsdoit@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>

              {/* Năm sinh có tự động tính tuổi */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Năm Sinh (4 số) *
                  </label>
                  {calculatedAge !== null && (
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                      ⚡ {calculatedAge} tuổi
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1920"
                    max={currentYear - 6}
                    placeholder="VD: 2004"
                    value={birthYear}
                    onChange={handleBirthYearChange}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 font-mono focus:outline-hidden focus:border-[#E81A7F]"
                  />
                </div>
                {calculatedAge !== null ? (
                  <p className="text-[10px] text-emerald-600 mt-1 font-medium">
                    ✓ Hệ thống tính tự động: <strong>{calculatedAge} tuổi</strong>
                  </p>
                ) : birthYear.length === 4 ? (
                  <p className="text-[10px] text-red-500 mt-1 font-medium">
                    Năm sinh không hợp lệ (từ 1920 đến {currentYear - 6})
                  </p>
                ) : null}
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Địa Chỉ / Tỉnh Thành Phố *</label>
              <input
                type="text"
                required
                placeholder="VD: Quận Cầu Giấy, Hà Nội hoặc TP. Hồ Chí Minh"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>

            {/* Skills checklist */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kỹ năng hoặc vai trò bạn muốn tham gia:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                {skillOptions.map((skill) => (
                  <label 
                    key={skill}
                    className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer transition-colors ${
                      selectedSkills.includes(skill) ? 'bg-pink-50 border-[#E81A7F] text-slate-900 font-bold' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      className="accent-[#E81A7F] w-3.5 h-3.5 rounded"
                    />
                    <span className="text-[11px]">{skill}</span>
                  </label>
                ))}
              </div>

              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Vai trò / Kỹ năng khác (nếu có)..."
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ghi Chú / Lời Nhắn Thêm (nếu có)</label>
              <textarea
                placeholder="VD: Tôi có thể hỗ trợ chuẩn bị nước uống và loa kéo..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#E81A7F]"
              />
            </div>

            <button
              type="submit"
              disabled={phone.length > 0 && phone.length !== 10}
              className="w-full bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-xs sm:text-sm py-3 rounded-2xl shadow-lg hover:shadow-pink-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>Xác Nhận Đăng Ký Tình Nguyện Viên</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>,
    document.body
  ) : null;
};


