import React, { useEffect, useState } from 'react';
import { CalendarDays, FileText, HeartHandshake, Image as ImageIcon, Mail, PenLine, Pin } from 'lucide-react';
import { api, type Entry } from './api';
import { useAdmin } from './AdminApp';
import { MetaBox, PageTitle } from './Layout';
import { formatDate, labelsFor, navigate, slugify, today } from './util';

// "Bảng tin": welcome panel, at-a-glance counts, recent activity and the
// quick draft box — the WordPress dashboard.

export function Dashboard() {
  const { collections, notify } = useAdmin();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [news, setNews] = useState<Entry[] | null>(null);
  const [events, setEvents] = useState<Entry[] | null>(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftBody, setDraftBody] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);

  const folders = collections.filter((c) => c.folder);

  useEffect(() => {
    folders.forEach((c) =>
      api.entries(c.name).then(
        (list) => {
          setCounts((n) => ({ ...n, [c.name]: list.length }));
          if (c.name === 'news') setNews(list);
          if (c.name === 'events') setEvents(list);
        },
        () => {}
      )
    );
    api.volunteers().then((l) => setCounts((n) => ({ ...n, '#volunteers': l.length })), () => {});
    api.contacts().then((l) => setCounts((n) => ({ ...n, '#contacts': l.length })), () => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collections]);

  const recentNews = [...(news ?? [])].sort((a, b) => String(b.data.date ?? '').localeCompare(String(a.data.date ?? ''))).slice(0, 6);
  const drafts = (news ?? []).filter((e) => e.data.status === 'Pending').slice(0, 4);
  const upcoming = [...(events ?? [])]
    .filter((e) => String(e.data.date ?? '') >= today())
    .sort((a, b) => String(a.data.date).localeCompare(String(b.data.date)))
    .slice(0, 5);

  const saveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftTitle.trim()) return;
    setSavingDraft(true);
    const slug = `${slugify(draftTitle).slice(0, 70) || 'ban-nhap'}`;
    const data = {
      title: draftTitle.trim(),
      category: 'News',
      date: today(),
      author: '',
      image: '',
      summary: draftBody.trim().split('\n')[0] ?? '',
      contentBlocks: draftBody.trim() ? [{ type: 'text', value: draftBody.trim() }] : [],
      status: 'Pending',
    };
    try {
      await api.save('news', slug, data);
      setNews((list) => [{ slug, data }, ...(list ?? [])]);
      setDraftTitle('');
      setDraftBody('');
      notify({
        type: 'success',
        text: (
          <>
            Đã lưu bản nháp. <a href={`#/c/news/edit/${slug}`}>Sửa bản nháp</a>
          </>
        ),
      });
    } catch (err: any) {
      notify({ type: 'error', text: err.message });
    } finally {
      setSavingDraft(false);
    }
  };

  const glance: { key: string; icon: React.ElementType; href: string; label: string }[] = [
    ...folders.map((c) => ({
      key: c.name,
      icon: c.name === 'news' ? Pin : c.name === 'events' ? CalendarDays : c.name === 'gallery' ? ImageIcon : FileText,
      href: `#/c/${c.name}`,
      label: labelsFor(c).menu,
    })),
    { key: '#volunteers', icon: HeartHandshake, href: '#/volunteers', label: 'Tình nguyện viên' },
    { key: '#contacts', icon: Mail, href: '#/contacts', label: 'Tin nhắn liên hệ' },
  ];

  return (
    <div>
      <PageTitle>Bảng tin</PageTitle>

      {/* Welcome panel */}
      <div className="wp-box p-6 mb-5">
        <h2 className="text-[21px] font-normal text-[#1d2327] mt-0 mb-1">Chào mừng đến trang quản trị Let's Do It! Vietnam!</h2>
        <p className="mt-0 mb-5 text-[var(--wp-muted)]">Mọi thay đổi được lưu thẳng lên website (qua GitHub), không cần làm gì thêm.</p>
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <h3 className="text-[15px] font-semibold mt-0 mb-3">Bắt đầu</h3>
            <button type="button" className="wp-btn wp-btn-primary wp-btn-lg" onClick={() => navigate('/c/news/new')}>
              <PenLine className="w-4 h-4" /> Viết bài mới
            </button>
            <p className="mb-0 mt-3 text-[13px]">
              hoặc <a href="/" target="_blank" rel="noreferrer">xem website</a>
            </p>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold mt-0 mb-3">Việc thường làm</h3>
            <ul className="m-0 p-0 list-none space-y-1.5">
              <li>
                <a href="#/c/events/new">Thêm sự kiện dọn rác mới</a>
              </li>
              <li>
                <a href="#/c/pages/edit/hero">Đổi ảnh banner trang chủ</a>
              </li>
              <li>
                <a href="#/c/pages/edit/header">Sửa dòng chữ chạy đầu trang</a>
              </li>
              <li>
                <a href="#/c/pages/edit/home">Chọn tin hiện ở trang chủ</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold mt-0 mb-3">Khác</h3>
            <ul className="m-0 p-0 list-none space-y-1.5">
              <li>
                <a href="#/media">Quản lý thư viện ảnh</a>
              </li>
              <li>
                <a href="#/volunteers">Xem tình nguyện viên đăng ký</a>
              </li>
              <li>
                <a href="#/contacts">Xem tin nhắn liên hệ</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 items-start">
        <div className="space-y-5">
          <MetaBox title="Sơ lược">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 m-0 p-0 list-none">
              {glance.map(({ key, icon: Icon, href, label }) => (
                <li key={key}>
                  <a href={href} className="inline-flex items-center gap-2 no-underline">
                    <Icon className="w-4 h-4 text-[#8c8f94]" />
                    <span>
                      {counts[key] ?? '…'} {label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </MetaBox>

          <MetaBox title="Hoạt động">
            <h3 className="text-[14px] font-normal text-[var(--wp-muted)] mt-0 mb-2">Sự kiện sắp diễn ra</h3>
            {!events ? (
              <p className="text-[var(--wp-muted)]">Đang tải…</p>
            ) : upcoming.length === 0 ? (
              <p className="text-[var(--wp-muted)] mt-0">Chưa có sự kiện sắp tới.</p>
            ) : (
              <ul className="m-0 p-0 list-none space-y-1.5 mb-4">
                {upcoming.map((e) => (
                  <li key={e.slug} className="flex gap-3">
                    <span className="w-24 shrink-0 text-[var(--wp-muted)]">{formatDate(e.data.date)}</span>
                    <a href={`#/c/events/edit/${e.slug}`}>{e.data.title}</a>
                  </li>
                ))}
              </ul>
            )}
            <h3 className="text-[14px] font-normal text-[var(--wp-muted)] mt-4 mb-2 pt-3 border-t border-[#f0f0f1]">Bài viết gần đây</h3>
            {!news ? (
              <p className="text-[var(--wp-muted)]">Đang tải…</p>
            ) : (
              <ul className="m-0 p-0 list-none space-y-1.5">
                {recentNews.map((e) => (
                  <li key={e.slug} className="flex gap-3">
                    <span className="w-24 shrink-0 text-[var(--wp-muted)]">{formatDate(e.data.date)}</span>
                    <a href={`#/c/news/edit/${e.slug}`}>{e.data.title}</a>
                  </li>
                ))}
              </ul>
            )}
          </MetaBox>
        </div>

        <MetaBox title="Bản nháp nhanh">
          <form onSubmit={saveDraft} className="space-y-3">
            <div>
              <label className="block mb-1" htmlFor="draft-title">
                Tiêu đề
              </label>
              <input id="draft-title" className="wp-input" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} />
            </div>
            <div>
              <label className="block mb-1" htmlFor="draft-body">
                Nội dung
              </label>
              <textarea
                id="draft-body"
                className="wp-input"
                rows={4}
                placeholder="Bạn đang nghĩ gì?"
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
              />
            </div>
            <button type="submit" className="wp-btn wp-btn-primary" disabled={savingDraft || !draftTitle.trim()}>
              {savingDraft ? 'Đang lưu…' : 'Lưu bản nháp'}
            </button>
          </form>
          {drafts.length > 0 && (
            <div className="mt-5 pt-3 border-t border-[#f0f0f1]">
              <h3 className="text-[14px] font-semibold mt-0 mb-2">Bản nháp của bạn</h3>
              <ul className="m-0 p-0 list-none space-y-1.5">
                {drafts.map((e) => (
                  <li key={e.slug}>
                    <a href={`#/c/news/edit/${e.slug}`}>{e.data.title}</a>{' '}
                    <span className="text-[13px] text-[var(--wp-muted)]">{formatDate(e.data.date)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </MetaBox>
      </div>
    </div>
  );
}
