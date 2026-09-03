import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Phone,
  ArrowLeft,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isInAppBrowser } from '../utils/browserUtils';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

type AuthView = 'main' | 'forgot-request' | 'forgot-reset';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login'
}) => {
  const { loginWithGoogle, loginWithFacebook, loginWithEmail, registerWithEmail, requestPasswordReset, resetPassword } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [view, setView] = useState<AuthView>('main');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);
  const [inAppBrowser] = useState(isInAppBrowser);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form states - Login
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');

  // Form states - Register
  const [fullName, setFullName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Form states - Forgot password
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setView('main');
      setError(null);
      setResetSuccessMsg(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const triggerSuccess = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setSocialLoading('google');
      setError(null);
      await loginWithGoogle();
      triggerSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setSocialLoading('facebook');
      setError(null);
      await loginWithFacebook();
      triggerSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập Facebook thất bại. Vui lòng thử lại.');
    } finally {
      setSocialLoading(null);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await loginWithEmail(emailOrUsername, password);
      triggerSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await registerWithEmail(fullName, registerEmail, password, phoneNumber);
      triggerSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Đăng ký không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await requestPasswordReset(resetEmail);
      setView('forgot-reset');
    } catch (err: any) {
      setError(err?.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await resetPassword(resetEmail, resetCode, newPassword);
      setResetSuccessMsg('Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.');
      setResetCode('');
      setNewPassword('');
      setTimeout(() => {
        setView('main');
        setActiveTab('login');
        setEmailOrUsername(resetEmail);
        setResetSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setError(err?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#E81A7F] to-[#E81A7F] p-6 text-white text-center relative">
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Let's do it! Vietnam</span>
          </div>

          <h3 className="text-2xl font-extrabold tracking-tight">
            {view === 'forgot-request' && 'Quên Mật Khẩu'}
            {view === 'forgot-reset' && 'Đặt Lại Mật Khẩu'}
            {view === 'main' && (activeTab === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản Mới')}
          </h3>
          <p className="text-xs text-white/90 mt-1">
            {view === 'forgot-request' && 'Nhập email đã đăng ký để nhận mã xác nhận'}
            {view === 'forgot-reset' && `Nhập mã 6 chữ số vừa gửi tới ${resetEmail}`}
            {view === 'main' && (activeTab === 'login'
              ? 'Chào mừng bạn quay trở lại với phong trào sống xanh'
              : 'Đăng ký tài khoản để bắt đầu tham gia các chiến dịch')}
          </p>
        </div>

        {/* Tab switcher: Đăng Nhập / Đăng Ký (hidden during forgot-password flow) */}
        {view === 'main' && (
          <div className="flex border-b border-slate-100 bg-slate-50/80 p-1.5 gap-1">
            <button
              id="auth-tab-login"
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-[#E81A7F] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              id="auth-tab-register"
              onClick={() => { setActiveTab('register'); setError(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-[#E81A7F] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Đăng Ký
            </button>
          </div>
        )}

        <div className="p-6">

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <div className="flex-1">
                <span>{error}</span>
                {error.includes('chưa được đăng ký') && (
                  <button
                    type="button"
                    onClick={() => { setView('main'); setActiveTab('register'); setError(null); }}
                    className="block font-bold text-[#E81A7F] hover:underline mt-1 cursor-pointer"
                  >
                    👉 Bấm vào đây để Đăng Ký ngay
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Success Message (password reset) */}
          {resetSuccessMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{resetSuccessMsg}</span>
            </div>
          )}

          {/* View: Forgot Password — Step 1: request code */}
          {view === 'forgot-request' && (
            <form onSubmit={handleRequestReset} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ Email đã đăng ký
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    autoFocus
                    placeholder="ban@gmail.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-sm py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                <span>{loading ? 'Đang gửi mã...' : 'Gửi Mã Xác Nhận'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => { setView('main'); setError(null); }}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer pt-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại đăng nhập</span>
              </button>
            </form>
          )}

          {/* View: Forgot Password — Step 2: enter code + new password */}
          {view === 'forgot-reset' && (
            <form onSubmit={handleConfirmReset} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã xác nhận (6 chữ số)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    autoFocus
                    maxLength={6}
                    inputMode="numeric"
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm tracking-widest font-mono focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Tối thiểu 6 ký tự..."
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-sm py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                <span>{loading ? 'Đang xác nhận...' : 'Đặt Lại Mật Khẩu'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => { setView('forgot-request'); setError(null); }}
                  className="flex items-center gap-1.5 font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Đổi email khác</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRequestReset({ preventDefault: () => {} } as React.FormEvent)}
                  className="font-bold text-[#E81A7F] hover:underline cursor-pointer"
                >
                  Gửi lại mã
                </button>
              </div>
            </form>
          )}

          {/* Social Logins: Google & Facebook (real OAuth) */}
          {view === 'main' && (
          <div className="space-y-2.5 mb-5">
            <button
              id="auth-google-login-btn"
              type="button"
              onClick={handleGoogleLogin}
              disabled={socialLoading !== null}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl border border-slate-200 shadow-xs hover:shadow transition-all cursor-pointer group disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{socialLoading === 'google' ? 'Đang kết nối Google...' : 'Đăng nhập với Google'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 ml-auto" />
            </button>

            {inAppBrowser && (
              <p className="text-[10px] text-amber-700 flex items-start gap-1 px-0.5">
                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                <span>Đang mở trong trình duyệt của ứng dụng này (Messenger/Instagram/Zalo/TikTok...) nên Google có thể báo lỗi — nếu vậy, dùng Email/Tên tài khoản bên dưới hoặc mở bằng Safari/Chrome.</span>
              </p>
            )}

            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-3 text-[11px] font-bold uppercase text-slate-400">
                Hoặc bằng tài khoản
              </span>
            </div>
          </div>
          )}

          {/* Form: Login */}
          {view === 'main' && activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email hoặc Tên tài khoản
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Nhập email hoặc tên tài khoản đã đăng ký..."
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => { setView('forgot-request'); setResetEmail(emailOrUsername.includes('@') ? emailOrUsername : ''); setError(null); }}
                    className="text-[11px] text-[#E81A7F] hover:underline cursor-pointer font-semibold"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>


              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-sm py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>{loading ? 'Đang kiểm tra tài khoản...' : 'Đăng Nhập Ngay'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                <span>Chưa có tài khoản? </span>
                <button
                  type="button"
                  onClick={() => { setActiveTab('register'); setError(null); }}
                  className="font-bold text-[#E81A7F] hover:underline cursor-pointer"
                >
                  Đăng ký ngay tại đây
                </button>
              </div>
            </form>
          )}

          {/* Form: Register */}
          {view === 'main' && activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="VD: Nguyễn Văn Nam"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa chỉ Email (dùng để đăng nhập) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="nam@gmail.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại (tùy chọn)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    placeholder="0987 654 321"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu khởi tạo *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Tối thiểu 6 ký tự..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-hidden focus:border-[#E81A7F] focus:ring-2 focus:ring-pink-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#E81A7F] hover:bg-[#D01370] text-white font-bold text-sm py-3 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>{loading ? 'Đang lưu tài khoản vào CSDL...' : 'Hoàn Tất Đăng Ký'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                <span>Đã có tài khoản? </span>
                <button
                  type="button"
                  onClick={() => { setActiveTab('login'); setError(null); }}
                  className="font-bold text-[#E81A7F] hover:underline cursor-pointer"
                >
                  Đăng nhập tại đây
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>,
    document.body
  ) : null;
};


