import React, { useEffect, useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { api } from './api';
import { useAdmin } from './AdminApp';
import { PageTitle } from './Layout';
import { formatDateTime } from './util';
import { downloadXlsx } from './xlsx';

// Tables of volunteer sign-ups and contact-form messages (stored in SQLite by
// the site's forms), with search, row selection, delete, "Sửa" for a
// volunteer, and an Excel (.xlsx) export of the selected or shown rows.

const COLUMNS = {
  volunteers: [
    { key: 'fullName', label: 'Họ tên' },
    { key: 'joinAs', label: 'Hình thức' },
    { key: 'participants', label: 'Số người' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Điện thoại' },
    { key: 'city', label: 'Địa chỉ' },
    { key: 'eventName', label: 'Sự kiện' },
    { key: 'preferredRole', label: 'Vai trò' },
    { key: 'ageGroup', label: 'Năm sinh' },
    { key: 'notes', label: 'Ghi chú' },
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
const JOIN_AS: Record<string, string> = { individual: 'Cá nhân', group: 'Nhóm', organization: 'Tổ chức' };
const ROLES = ['Clean-up', 'Media', 'Leader', 'Logistics'];

type EventOption = { id: string; title: string };

export function Submissions({ kind }: { kind: 'volunteers' | 'contacts' }) {
  const { notify } = useAdmin();
  const [rows, setRows] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [event, setEvent] = useState('');
  const [checked, setChecked] = useState<string[]>([]);
  const [bulk, setBulk] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [eventList, setEventList] = useState<EventOption[]>([]);
  const columns = COLUMNS[kind];
  const isVolunteers = kind === 'volunteers';
  const singular = isVolunteers ? 'tình nguyện viên' : 'tin nhắn';

  useEffect(() => {
    setRows(null);
    setChecked([]);
    setEditing(null);
    (isVolunteers ? api.volunteers() : api.contacts()).then(setRows, (err) => setError(err.message));
    if (isVolunteers) {
      fetch('/api/events')
        .then((r) => r.json())
        .then((list: EventOption[]) => setEventList(Array.isArray(list) ? list.map((e) => ({ id: e.id, title: e.title })) : []))
        .catch(() => {});
    }
  }, [kind, isVolunteers]);

  const events = useMemo(() => [...new Set((rows ?? []).map((r) => r.eventName).filter(Boolean))].sort(), [rows]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (rows ?? []).filter((r) => (!event || r.eventName === event) && (!q || JSON.stringify(r).toLowerCase().includes(q)));
  }, [rows, query, event]);

  useEffect(() => setChecked([]), [query, event]);

  // Events a sign-up can be moved to: the site's events, plus any older event a sign-up still points at.
  const eventOptions = useMemo(() => {
    const list = [...eventList];
    for (const r of rows ?? []) {
      if (r.eventId && !list.some((e) => e.id === r.eventId)) list.push({ id: r.eventId, title: r.eventName || r.eventId });
    }
    return list;
  }, [eventList, rows]);

  const text = (r: any, key: string) => {
    const v = r[key];
    if (DATE_KEYS.includes(key)) return formatDateTime(v);
    // One column: "Cá nhân", or "Nhóm: <name>" / "Tổ chức: <name>".
    if (key === 'joinAs') {
      const label = JOIN_AS[v as string] ?? 'Cá nhân';
      return v !== 'individual' && r.organizationName ? `${label}: ${r.organizationName}` : label;
    }
    if (key === 'preferredRole' && !v) return Array.isArray(r.skills) ? r.skills.join(', ') : '';
    if (Array.isArray(v)) return v.join(', ');
    return v == null ? '' : String(v);
  };

  const selected = filtered.filter((r) => checked.includes(r.id));
  const exportRows = selected.length ? selected : filtered;

  const exportXlsx = () => {
    const title = isVolunteers ? 'Tình nguyện viên' : 'Liên hệ';
    downloadXlsx(
      `${isVolunteers ? 'tinh-nguyen-vien' : 'lien-he'}-${new Date().toISOString().slice(0, 10)}.xlsx`,
      event ? event : title,
      columns.map((c) => c.label),
      // Numbers stay numbers (Excel can sum them); phone numbers stay text, keeping their leading 0.
      exportRows.map((r) => columns.map((c) => (c.key === 'participants' && typeof r[c.key] === 'number' ? r[c.key] : text(r, c.key))))
    );
  };

  const nameOf = (r: any) => String(r.fullName || r.name || r.email || '');

  const remove = async (targets: any[]) => {
    const what = targets.length === 1 ? `“${nameOf(targets[0])}”` : `${targets.length} ${singular} đã chọn`;
    if (!window.confirm(`Xóa vĩnh viễn ${what}? Không thể hoàn tác.`)) return;
    setBusy(true);
    let done = 0;
    try {
      for (const r of targets) {
        await api.removeSubmission(kind, r.id);
        done++;
        setRows((list) => (list ?? []).filter((x) => x.id !== r.id));
      }
      notify({ type: 'success', text: `Đã xóa ${targets.length === 1 ? what : `${done} ${singular}`}.` });
    } catch (err: any) {
      notify({ type: 'error', text: `Đã xóa ${done}/${targets.length}. Lỗi: ${err.message}` });
    } finally {
      setChecked((c) => c.filter((id) => !targets.some((r) => r.id === id)));
      setBulk('');
      setBusy(false);
    }
  };

  const allChecked = filtered.length > 0 && filtered.every((r) => checked.includes(r.id));
  const colCount = columns.length + 1;

  return (
    <div>
      <PageTitle
        action={
          <button type="button" className="wp-btn" onClick={exportXlsx} disabled={!exportRows.length}>
            <Download className="w-4 h-4" /> Xuất file Excel{selected.length ? ` (${selected.length} đã chọn)` : ''}
          </button>
        }
      >
        {isVolunteers ? 'Tình nguyện viên đăng ký' : 'Tin nhắn liên hệ'}
      </PageTitle>
      <p className="mt-0 mb-3 text-[13px] text-[var(--wp-muted)]">
        {isVolunteers
          ? 'Các lượt đăng ký qua nút "Đăng ký tình nguyện" trên website (cũng được ghi vào Google Sheet — sửa/xóa ở đây không đổi Google Sheet). Tích chọn để xuất Excel hoặc xóa nhiều mục.'
          : 'Các tin nhắn gửi qua trang Liên hệ.'}
      </p>

      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <select className="wp-input !w-auto" value={bulk} onChange={(e) => setBulk(e.target.value)} aria-label="Hành động hàng loạt">
            <option value="">Hành động</option>
            <option value="delete">Xóa</option>
          </select>
          <button type="button" className="wp-btn" disabled={busy || bulk !== 'delete' || !selected.length} onClick={() => remove(selected)}>
            {busy ? 'Đang xóa…' : 'Áp dụng'}
          </button>
          {isVolunteers && (
            <select className="wp-input !w-auto max-w-full sm:ml-2" value={event} onChange={(e) => setEvent(e.target.value)} aria-label="Lọc theo sự kiện">
              <option value="">Tất cả sự kiện</option>
              {events.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-[13px] text-[var(--wp-muted)] whitespace-nowrap">
            {selected.length ? `${selected.length} / ` : ''}
            {filtered.length} mục
          </span>
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
              <th className="w-8 !px-2">
                <input
                  type="checkbox"
                  aria-label="Chọn tất cả"
                  checked={allChecked}
                  onChange={() => setChecked(allChecked ? [] : filtered.map((r) => r.id))}
                />
              </th>
              {columns.map((c) => (
                <th key={c.key}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!rows && !error && (
              <tr>
                <td colSpan={colCount} className="text-[var(--wp-muted)]">
                  Đang tải…
                </td>
              </tr>
            )}
            {rows && filtered.length === 0 && (
              <tr>
                <td colSpan={colCount} className="text-[var(--wp-muted)]">
                  Chưa có mục nào.
                </td>
              </tr>
            )}
            {filtered.map((r) =>
              editing === r.id ? (
                <VolunteerEditRow
                  key={r.id}
                  volunteer={r}
                  events={eventOptions}
                  colSpan={colCount}
                  onCancel={() => setEditing(null)}
                  onSaved={(saved) => {
                    setRows((list) => (list ?? []).map((x) => (x.id === saved.id ? saved : x)));
                    setEditing(null);
                    notify({ type: 'success', text: `Đã cập nhật “${nameOf(saved)}”.` });
                  }}
                />
              ) : (
                <tr key={r.id}>
                  <td className="!px-2">
                    <input
                      type="checkbox"
                      aria-label={`Chọn ${nameOf(r)}`}
                      checked={checked.includes(r.id)}
                      onChange={() => setChecked((c) => (c.includes(r.id) ? c.filter((x) => x !== r.id) : [...c, r.id]))}
                    />
                  </td>
                  {columns.map((c, i) => (
                    <td
                      key={c.key}
                      className={c.key === 'message' || c.key === 'notes' ? 'min-w-[220px] whitespace-pre-line' : 'whitespace-nowrap'}
                    >
                      {c.key === 'email' && r.email ? <a href={`mailto:${r.email}`}>{r.email}</a> : text(r, c.key)}
                      {i === 0 && (
                        <div className="row-actions">
                          {isVolunteers && (
                            <>
                              <button type="button" className="text-[var(--wp-blue)] hover:underline" onClick={() => setEditing(r.id)}>
                                Sửa
                              </button>
                              {' | '}
                            </>
                          )}
                          <button type="button" className="text-[var(--wp-red)] hover:underline" disabled={busy} onClick={() => remove([r])}>
                            Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** "Sửa": a volunteer's details edited right in the table. */
function VolunteerEditRow({
  volunteer,
  events,
  colSpan,
  onCancel,
  onSaved,
}: {
  volunteer: any;
  events: EventOption[];
  colSpan: number;
  onCancel: () => void;
  onSaved: (saved: any) => void;
}) {
  const [data, setData] = useState(() => ({
    fullName: volunteer.fullName ?? '',
    email: volunteer.email ?? '',
    phone: volunteer.phone ?? '',
    city: volunteer.city ?? '',
    joinAs: volunteer.joinAs ?? 'individual',
    organizationName: volunteer.organizationName ?? '',
    participants: String(volunteer.participants ?? 1),
    ageGroup: volunteer.ageGroup ?? '',
    eventId: volunteer.eventId ?? '',
    preferredRole: volunteer.preferredRole || (Array.isArray(volunteer.skills) ? volunteer.skills[0] ?? '' : ''),
    notes: volunteer.notes ?? '',
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof data, v: string) => setData((d) => ({ ...d, [k]: v }));
  const isTeam = data.joinAs !== 'individual';
  const roles = data.preferredRole && !ROLES.includes(data.preferredRole) ? [...ROLES, data.preferredRole] : ROLES;

  const save = async () => {
    if (!data.fullName.trim()) {
      setError('Vui lòng nhập họ tên.');
      return;
    }
    setSaving(true);
    setError('');
    const eventName = events.find((e) => e.id === data.eventId)?.title ?? volunteer.eventName ?? '';
    try {
      const saved = await api.saveVolunteer(volunteer.id, {
        ...data,
        eventName,
        organizationName: isTeam ? data.organizationName : '',
        participants: isTeam ? data.participants : '1',
      });
      onSaved(saved);
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  const label = 'block text-[13px] text-[var(--wp-muted)] mb-0.5';
  const input = (k: keyof typeof data, text: string, type = 'text') => (
    <div>
      <label className={label}>{text}</label>
      <input type={type} className="wp-input" value={data[k]} onChange={(e) => set(k, e.target.value)} />
    </div>
  );

  return (
    <tr className="!bg-white">
      <td colSpan={colSpan} className="!p-4 border-y border-[#dcdcde]">
        <h3 className="m-0 mb-3 text-[12px] font-semibold uppercase text-[#1d2327]">Sửa tình nguyện viên</h3>
        <div className="grid gap-5 md:grid-cols-3 max-w-[1100px]">
          <div className="space-y-2.5">
            {input('fullName', 'Họ tên')}
            {input('email', 'Email', 'email')}
            {input('phone', 'Điện thoại', 'tel')}
            {input('city', 'Địa chỉ')}
          </div>
          <div className="space-y-2.5">
            <div>
              <label className={label}>Hình thức</label>
              <select className="wp-input" value={data.joinAs} onChange={(e) => set('joinAs', e.target.value)}>
                {Object.entries(JOIN_AS).map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </select>
            </div>
            {isTeam && input('organizationName', data.joinAs === 'organization' ? 'Tên tổ chức' : 'Tên nhóm')}
            {isTeam ? (
              input('participants', 'Số người', 'number')
            ) : (
              <div>
                <label className={label}>Số người</label>
                <input className="wp-input !bg-[#f0f0f1] text-[var(--wp-muted)]" value="1" readOnly title="Cá nhân luôn là 1 người" />
              </div>
            )}
            {input('ageGroup', 'Năm sinh')}
          </div>
          <div className="space-y-2.5">
            <div>
              <label className={label}>Sự kiện</label>
              <select className="wp-input" value={data.eventId} onChange={(e) => set('eventId', e.target.value)}>
                {!data.eventId && <option value="">— Chọn sự kiện —</option>}
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Vai trò</label>
              <select className="wp-input" value={data.preferredRole} onChange={(e) => set('preferredRole', e.target.value)}>
                {!data.preferredRole && <option value="">—</option>}
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Ghi chú (chỉ admin thấy)</label>
              <textarea className="wp-input" rows={3} value={data.notes} onChange={(e) => set('notes', e.target.value)} />
            </div>
          </div>
        </div>
        {error && <div className="wp-notice wp-notice-error mt-3">{error}</div>}
        <div className="flex items-center gap-2 mt-4">
          <button type="button" className="wp-btn wp-btn-primary" disabled={saving} onClick={save}>
            {saving ? 'Đang lưu…' : 'Cập nhật'}
          </button>
          <button type="button" className="wp-btn" onClick={onCancel}>
            Hủy
          </button>
        </div>
      </td>
    </tr>
  );
}
