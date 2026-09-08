import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { sendPasswordResetEmail } from '../services/emailService';

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

async function authRequest<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/auth${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
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
  }, []);

  const applySession = (u: AuthUser) => {
    setUser(u);
    setIsEligibleForAdmin(!!u.isEligibleForAdmin);
    return u;
  };

  const loginWithGoogle = async (): Promise<UserProfile> => {
    const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google login is not configured. Please add VITE_GOOGLE_CLIENT_ID to the .env file (see the instructions in .env.example).');
    }
    if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
      throw new Error('Unable to load the Google login service. Please check your network connection and disable any ad blockers, then try again.');
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
            reject(new Error('You closed the Google login window before completing sign-in.'));
          } else {
            reject(new Error(`Google login failed: ${err?.type || 'unknown error'}. Check the Client ID and authorized domains in Google Cloud Console.`));
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
      throw new Error('Unable to load the Facebook login service. Please check your network connection and disable any ad blockers, then try again.');
    }

    const accessToken = await new Promise<string>((resolve, reject) => {
      (window as any).FB.login((response: any) => {
        if (response.authResponse?.accessToken) {
          resolve(response.authResponse.accessToken);
        } else {
          reject(new Error('The user canceled Facebook login or closed the authentication window.'));
        }
      }, { scope: 'public_profile,email' });
    });

    const { user: loggedIn } = await authRequest<{ user: AuthUser }>('/facebook', { accessToken });
    return applySession(loggedIn);
  };

  const loginWithEmail = async (emailOrUsername: string, pass: string): Promise<UserProfile> => {
    const trimmedInput = (emailOrUsername || '').trim();
    if (!trimmedInput || !pass) {
      throw new Error('Please fill in both your account and password.');
    }
    const { user: loggedIn } = await authRequest<{ user: AuthUser }>('/login', {
      identifier: trimmedInput,
      password: pass,
    });
    return applySession(loggedIn);
  };

  const registerWithEmail = async (name: string, email: string, pass: string, phone?: string): Promise<UserProfile> => {
    if (!name || !email || !pass) {
      throw new Error('Please fill in all required fields.');
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
    if (!trimmedEmail) throw new Error('Please enter your email address.');

    const { code, name } = await authRequest<{ code: string; name: string }>('/request-reset', { email: trimmedEmail });
    const result = await sendPasswordResetEmail(trimmedEmail, name, code);
    if (!result.success) {
      throw new Error(result.message || 'Unable to send the email. Please try again.');
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
    const trimmedEmail = (email || '').trim().toLowerCase();
    const trimmedCode = (code || '').trim();
    if (!trimmedEmail || !trimmedCode || !newPassword) {
      throw new Error('Please fill in all fields.');
    }
    if (newPassword.length < 6) {
      throw new Error('The new password must be at least 6 characters.');
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
