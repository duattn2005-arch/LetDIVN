import React, { useEffect, useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { api } from './api';
import { PageTitle } from './Layout';
import { formatDateTime } from './util';

// Read-only tables of volunteer sign-ups and contact-form messages (stored in
// SQLite by the site's forms), with search and a CSV export for Excel.

const COLUMNS = {
  volunteers: [
    { key: 'fullName', label: 'Họ tên' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Điện thoại' },
    { key: 'city', label: 'Tỉnh / TP' },
    { key: 'eventName', label: 'Sự kiện' },
    { key: 'ageGroup', label: 'Độ tuổi' },
    { key: 'tshirtSize', label: 'Size áo' },
    { key: 'registeredAt', label: 'Ngày đăng ký' },
  ],
  contacts: [
    { key: 'name', label: 'Họ tên' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Điện thoại' },
    { key: 'subject', label: 'Chủ đề' },
    { key: 'message', label: 'Nội dung' },
    { key: 'createdAt', label: 'Ngày gửi' },
  ],
};

const DATE_KEYS = ['registeredAt', 'createdAt'];

export function Submissions({ kind }: { kind: 'volunteers' | 'contacts' }) {
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [event, setEvent] = useState('');
  const columns = COLUMNS[kind];

  useEffect(() => {
    setRows(null);
    (kind === 'volunteers' ? api.volunteers() : api.contacts()).then(setRows, (err) => setError(err.message));
  }, [kind]);

  const events = useMemo(() => [...new Set((rows ?? []).map((r) => r.eventName).filter(Boolean))].sort(), [rows]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter((r) => (!event || r.eventName === event) && (!q || JSON.stringify(r).toLowerCase().includes(q)));
  }, [rows, query, event]);

  const text = (r: any, key: string) => {
    const v = r[key];
    if (DATE_KEYS.includes(key)) return formatDateTime(v);
    if (Array.isArray(v)) return v.join(', ');
    return v == null ? '' : String(v);
  };

  const exportCsv = () => {
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const lines = [columns.map((c) => esc(c.label)).join(','), ...filtered.map((r) => columns.map((c) => esc(text(r, c.key))).join(','))];
    // The BOM makes Excel read the Vietnamese text as UTF-8.
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${kind === 'volunteers' ? 'tinh-nguyen-vien' : 'lien-he'}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      <PageTitle
        action={
          <button type="button" className="wp-btn" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="w-4 h-4" /> Xuất file Excel (CSV)
          </button>
        }
      >
        {kind === 'volunteers' ? 'Tình nguyện viên đăng ký' : 'Tin nhắn liên hệ'}
      </PageTitle>
      <p className="mt-0 mb-3 text-[13px] text-[var(--wp-muted)]">
        {kind === 'volunteers'
          ? 'Các lượt đăng ký qua nút "Đăng ký tình nguyện" trên website (cũng được ghi vào Google Sheet).'
          : 'Các tin nhắn gửi qua trang Liên hệ.'}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        {kind === 'volunteers' ? (
          <select className="wp-input !w-auto max-w-full" value={event} onChange={(e) => setEvent(e.target.value)}>
            <option value="">Tất cả sự kiện</option>
            {events.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-[13px] text-[var(--wp-muted)] whitespace-nowrap">{filtered.length} mục</span>
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-2 top-2 text-[#8c8f94]" />
            <input className="wp-input !pl-8" placeholder="Tìm kiếm…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </div>

      {error && <div className="wp-notice wp-notice-error mb-3">{error}</div>}

      <div className="overflow-x-auto">
        <table className="wp-table text-[13px]">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!rows && !error && (
              <tr>
                <td colSpan={columns.length} className="text-[var(--wp-muted)]">
                  Đang tải…
                </td>
              </tr>
            )}
            {rows && filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-[var(--wp-muted)]">
                  Chưa có mục nào.
                </td>
              </tr>
            )}
            {filtered.map((r) => (
              <tr key={r.id}>
                {columns.map((c) => (
                  <td key={c.key} className={c.key === 'message' ? 'min-w-[280px] whitespace-pre-line' : 'whitespace-nowrap'}>
                    {c.key === 'email' && r.email ? <a href={`mailto:${r.email}`}>{r.email}</a> : text(r, c.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
