import React, { useState } from 'react';
import { api } from './api';

export function Login({ onLogin }: { onLogin: (user: string) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { user } = await api.login(username, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-[8vh] px-4">
      <a href="/" className="flex flex-col items-center gap-2 mb-6 no-underline">
        <img src="/logo.png" alt="" className="w-20 h-20 object-contain" />
        <span className="text-lg font-semibold text-[#1d2327]">Let's Do It! Vietnam</span>
      </a>

      {error && (
        <div className="wp-notice wp-notice-error w-full max-w-[320px] mb-4">
          <span>
            <strong>Lỗi:</strong> {error}
          </span>
        </div>
      )}

      <form onSubmit={submit} className="wp-box w-full max-w-[320px] p-6 space-y-4">
        <div>
          <label htmlFor="user" className="block mb-1">
            Tên người dùng
          </label>
          <input
            id="user"
            className="wp-input text-lg"
            autoComplete="username"
            autoFocus
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="pass" className="block mb-1">
            Mật khẩu
          </label>
          <input
            id="pass"
            type="password"
            className="wp-input text-lg"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="wp-btn wp-btn-primary" disabled={busy}>
            {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
          </button>
        </div>
      </form>

      <a href="/" className="mt-6 text-[13px] text-[#50575e]">
        ← Quay lại Let's Do It! Vietnam
      </a>
    </div>
  );
}
