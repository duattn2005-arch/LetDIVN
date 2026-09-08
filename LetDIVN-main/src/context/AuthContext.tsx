import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { sendPasswordResetEmail } from '../services/emailService';
import { isInAppBrowser } from '../utils/browserUtils';

type AuthUser = UserProfile & { isEligibleForAdmin?: boolean };

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCoordinator: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<UserProfile>;
  loginWithFacebook: () => Promise<UserProfile>;
  loginWithEmail: (emailOrUsername: string, pass: string) => Promise<UserProfile>;
  registerWithEmail: (name: string, email: string, pass: string, phone?: string) => Promise<UserProfile>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const GOOGLE_REDIRECT_NONCE_KEY = 'ldiv_google_redirect_nonce';

// Full top-level navigation to Google itself — no popup, so no
// window.opener relationship for an OS-level browser hand-off to sever.
// Used for in-app browsers (Messenger/Zalo/...) where the popup-based flow
// can never report back to the opener. The nonce guards against a captured
// token being replayed later; the server checks it matches on return.
function redirectToGoogleSignIn(clientId: string): void {
  const nonce =
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : '') ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  try { sessionStorage.setItem(GOOGLE_REDIRECT_NONCE_KEY, nonce); } catch { /* ignore */ }
  const params = new URLSearchParams({
    client_id: clientId,
    // Must exactly match an "Authorized redirect URI" already registered
    // for this OAuth client in Google Cloud Console — reusing this one
    // (originally added for the old GIS-button flow) avoids needing the
    // project owner to add yet another one. Nothing needs to actually
    // handle this path server-side: with no matching route, Express falls
    // through to the SPA's catch-all and serves index.html, and the ID
    // token in the fragment never reaches the server anyway — this
    // component reads it client-side after mount.
    redirect_uri: `${window.location.origin}/api/auth/google-onetap`,
    response_type: 'id_token',
    scope: 'openid email profile',
    nonce,
    prompt: 'select_account',
  });
  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function authRequest<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/auth${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Yêu cầu thất bại');
  return data;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Captured once per real session — stays put even after switchRole flips
  // `user.role` locally for the volunteer-view preview, so the "back to
  // admin" toggle keeps working regardless of the currently-displayed role.
  const [isEligibleForAdmin, setIsEligibleForAdmin] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setIsEligibleForAdmin(!!data.user?.isEligibleForAdmin);
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));

    // Landed back here from the redirect-mode Google sign-in (used for
    // in-app browsers, where a popup can't report back to its opener — see
    // loginWithGoogle). Google puts the ID token in the URL fragment, which
    // never reaches the server, so the client has to read it and hand it to
    // the backend itself.
    if (typeof window !== 'undefined' && window.location.hash.includes('id_token=')) {
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const idToken = hashParams.get('id_token');
      const hashError = hashParams.get('error');
      let expectedNonce: string | null = null;
      try {
        expectedNonce = sessionStorage.getItem(GOOGLE_REDIRECT_NONCE_KEY);
        sessionStorage.removeItem(GOOGLE_REDIRECT_NONCE_KEY);
      } catch { /* ignore */ }
      // Scrub the token out of the visible URL/history right away regardless of outcome.
      window.history.replaceState(null, '', window.location.pathname + window.location.search);

      if (idToken && !hashError) {
        authRequest<{ user: AuthUser }>('/google-idtoken', { idToken, nonce: expectedNonce })
          .then(({ user: loggedIn }) => applySession(loggedIn))
          .catch(() => {
            window.setTimeout(() => alert('Đăng nhập Google thất bại. Vui lòng thử lại hoặc dùng Email/Tên tài khoản.'), 300);
          });
      }
    }
  }, []);

  const applySession = (u: AuthUser) => {
    setUser(u);
    setIsEligibleForAdmin(!!u.isEligibleForAdmin);
    return u;
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Đăng nhập Google chưa được cấu hình. Vui lòng thêm VITE_GOOGLE_CLIENT_ID vào file .env (xem hướng dẫn trong .env.example).');
    }

    // In-app browsers (Messenger/Instagram/Zalo/TikTok/...) sever a popup's
    // connection back to its opener — whether Google renders its own sign-in
    // UI there or the OS hands the popup off to a separate browser, the
    // popup-based flow below can never report the result back. A full
    // top-level redirect has no popup/opener relationship to break: whatever
    // browser ends up handling it completes the round trip itself.
    if (isInAppBrowser()) {
      redirectToGoogleSignIn(GOOGLE_CLIENT_ID);
      return new Promise<UserProfile>(() => { /* page is navigating away */ });
    }

    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      throw new Error('Không thể tải dịch vụ đăng nhập Google. Vui lòng kiểm tra kết nối mạng và tắt trình chặn quảng cáo, sau đó thử lại.');
    }

    const accessToken = await new Promise<string>((resolve, reject) => {
      const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: (tokenResponse: any) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error));
            return;
          }
          resolve(tokenResponse.access_token);
        },
        error_callback: (err: any) => {
          if (err?.type === 'popup_closed') {
            reject(new Error('Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.'));
          } else {
            reject(new Error(`Đăng nhập Google thất bại: ${err?.type || 'lỗi không xác định'}. Kiểm tra lại Client ID và tên miền được cấp phép trong Google Cloud Console.`));
          }
        },
      });
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    });

    const { user: loggedIn } = await authRequest<{ user: AuthUser }>('/google', { accessToken });
    return applySession(loggedIn);
  };

  const loginWithFacebook = async (): Promise<UserProfile> => {
    if (typeof window === 'undefined' || !(window as any).FB) {
      throw new Error('Không thể tải dịch vụ đăng nhập Facebook. Vui lòng kiểm tra kết nối mạng và tắt trình chặn quảng cáo, sau đó thử lại.');
    }

    const accessToken = await new Promise<string>((resolve, reject) => {
      (window as any).FB.login((response: any) => {
        if (response.authResponse?.accessToken) {
          resolve(response.authResponse.accessToken);
        } else {
          reject(new Error('Người dùng đã hủy đăng nhập Facebook hoặc đóng cửa sổ xác thực.'));
        }
      }, { scope: 'public_profile,email' });
    });

    const { user: loggedIn } = await authRequest<{ user: AuthUser }>('/facebook', { accessToken });
    return applySession(loggedIn);
  };

  const loginWithEmail = async (emailOrUsername: string, pass: string): Promise<UserProfile> => {
    const trimmedInput = (emailOrUsername || '').trim();
    if (!trimmedInput || !pass) {
      throw new Error('Vui lòng điền đầy đủ tài khoản và mật khẩu.');
    }
    const { user: loggedIn } = await authRequest<{ user: AuthUser }>('/login', {
      identifier: trimmedInput,
      password: pass,
    });
    return applySession(loggedIn);
  };

  const registerWithEmail = async (name: string, email: string, pass: string, phone?: string): Promise<UserProfile> => {
    if (!name || !email || !pass) {
      throw new Error('Vui lòng điền đầy đủ các thông tin bắt buộc.');
    }
    const { user: registered } = await authRequest<{ user: AuthUser }>('/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: pass,
      phone: phone?.trim(),
    });
    return applySession(registered);
  };

  const requestPasswordReset = async (email: string): Promise<void> => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    if (!trimmedEmail) throw new Error('Vui lòng nhập địa chỉ email.');

    const { code, name } = await authRequest<{ code: string; name: string }>('/request-reset', { email: trimmedEmail });
    const result = await sendPasswordResetEmail(trimmedEmail, name, code);
    if (!result.success) {
      throw new Error(result.message || 'Không thể gửi email. Vui lòng thử lại.');
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedCode = (code || '').trim();
    if (!trimmedEmail || !trimmedCode || !newPassword) {
      throw new Error('Vui lòng điền đầy đủ thông tin.');
    }
    if (newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
    }
    await authRequest('/reset-password', { email: trimmedEmail, code: trimmedCode, newPassword });
  };

  const logout = () => {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).finally(() => {
      setUser(null);
      setIsEligibleForAdmin(false);
    });
  };

  // Pure client-side view toggle for admins to preview the volunteer
  // experience — never touches the server, so it can't downgrade the real
  // stored role. isEligibleForAdmin (captured at login) is what lets the
  // toggle find its way back, independent of the currently-displayed role.
  const switchRole = (role: UserRole) => {
    if (!user) return;
    if (role === 'admin' && !isEligibleForAdmin) return;
    setUser({ ...user, role });
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isCoordinator: user?.role === 'coordinator' || user?.role === 'admin',
        isLoading,
        loginWithGoogle,
        loginWithFacebook,
        loginWithEmail,
        registerWithEmail,
        requestPasswordReset,
        resetPassword,
        logout,
        switchRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
