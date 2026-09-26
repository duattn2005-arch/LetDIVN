import React, { useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  CircleChevronLeft,
  ExternalLink,
  FileText,
  FolderKanban,
  Handshake,
  HeartHandshake,
  Home,
  Image as ImageIcon,
  Images,
  Info,
  LayoutDashboard,
  Leaf,
  LogOut,
  Mail,
  Menu,
  Newspaper,
  Pin,
  Plus,
  Users,
  Video,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAdmin, type Notice } from './AdminApp';

const ICONS: Record<string, LucideIcon> = {
  news: Pin,
  events: CalendarDays,
  pages: FileText,
  projects: FolderKanban,
  videos: Video,
  partners: Handshake,
  team: Users,
  gallery: Images,
  'what-we-do': Leaf,
  'who-we-are': Info,
  'media-coverage': Newspaper,
};

// WordPress puts Posts and Media first, then Pages, then everything else.
const MENU_ORDER = ['news', 'events', '#media', 'pages', 'projects'];

interface MenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
  sub?: { label: string; href: string }[];
}

export function Layout({
  route,
  onLogout,
  notice,
  onDismissNotice,
  children,
}: {
  route: string[];
  onLogout: () => void;
  notice: Notice | null;
  onDismissNotice: () => void;
  children: React.ReactNode;
}) {
  const { user, local, collections } = useAdmin();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const collectionItems: MenuItem[] = collections.map((c) => ({
    key: c.name,
    label: c.label,
    icon: ICONS[c.name] || FileText,
    href: `#/c/${c.name}`,
    sub: c.folder
      ? [
          { label: `Tất cả ${c.label_singular || c.label}`, href: `#/c/${c.name}` },
          ...(c.create !== false ? [{ label: 'Thêm mới', href: `#/c/${c.name}/new` }] : []),
        ]
      : undefined,
  }));
  const mediaItem: MenuItem = {
    key: '#media',
    label: 'Thư viện',
    icon: ImageIcon,
    href: '#/media',
    sub: [
      { label: 'Thư viện', href: '#/media' },
      { label: 'Tải lên', href: '#/media/upload' },
    ],
  };
  const rank = (k: string) => (MENU_ORDER.includes(k) ? MENU_ORDER.indexOf(k) : MENU_ORDER.length);
  const items = [...collectionItems, mediaItem].sort((a, b) => rank(a.key) - rank(b.key));

  const activeKey = !route[0] ? '#dashboard' : route[0] === 'c' ? route[1] : route[0] === 'media' ? '#media' : `#${route[0]}`;
  const currentHref = `#/${route.join('/')}`;

  const newItems = collections.filter((c) => c.folder && c.create !== false).slice(0, 6);

  const renderItem = (item: MenuItem) => {
    const active = item.key === activeKey;
    const Icon = item.icon;
    return (
      <li key={item.key} className="group relative">
        <a
          href={item.href}
          onClick={() => setMobileOpen(false)}
          title={collapsed ? item.label : undefined}
          className={`flex items-center gap-2.5 px-3 py-2 text-[14px] no-underline ${
            active ? 'bg-[var(--wp-blue)] text-white' : 'text-[#f0f0f1] hover:bg-[#2c3338] hover:text-[#72aee6]'
          }`}
        >
          <Icon className="w-5 h-5 shrink-0 opacity-80" />
          {!collapsed && <span className="leading-tight">{item.label}</span>}
        </a>
        {active && item.sub && !collapsed && (
          <ul className="bg-[var(--wp-submenu)] py-1.5">
            {item.sub.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block pl-[42px] pr-3 py-1 text-[13px] no-underline hover:text-[#72aee6] ${
                    currentHref === s.href ? 'text-white font-semibold' : 'text-[#c3c4c7]'
                  }`}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  const extraItem = (key: string, label: string, Icon: LucideIcon, href: string) =>
    renderItem({ key, label, icon: Icon, href });

  return (
    <div className="min-h-screen">
      {/* Admin bar */}
      <div className="fixed top-0 inset-x-0 z-40 h-[46px] md:h-8 bg-[var(--wp-bar)] text-[#f0f0f1] flex items-center text-[13px]">
        <button className="md:hidden px-3 h-full" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <a href="/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 h-full text-[#f0f0f1] no-underline hover:bg-[#2c3338] hover:text-[#72aee6]">
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Let's Do It! Vietnam</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
        <div className="relative h-full" onMouseLeave={() => setNewOpen(false)}>
          <button
            className="flex items-center gap-1.5 px-3 h-full hover:bg-[#2c3338] hover:text-[#72aee6]"
            onClick={() => setNewOpen(!newOpen)}
            onMouseEnter={() => setNewOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Mới</span>
          </button>
          {newOpen && (
            <ul className="absolute left-0 top-full min-w-[180px] bg-[var(--wp-submenu)] py-1.5 shadow-lg">
              {newItems.map((c) => (
                <li key={c.name}>
                  <a
                    href={`#/c/${c.name}/new`}
                    onClick={() => setNewOpen(false)}
                    className="block px-4 py-1.5 text-[#f0f0f1] no-underline hover:text-[#72aee6] first-letter:uppercase"
                  >
                    {c.label_singular || c.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#/media/upload" onClick={() => setNewOpen(false)} className="block px-4 py-1.5 text-[#f0f0f1] no-underline hover:text-[#72aee6]">
                  Media
                </a>
              </li>
            </ul>
          )}
        </div>
        {local && <span className="ml-2 px-2 py-0.5 rounded bg-amber-500 text-black text-[11px] font-semibold">Bản chạy thử (sửa file trên máy)</span>}

        <div className="ml-auto relative h-full" onMouseLeave={() => setUserOpen(false)}>
          <button
            className="flex items-center gap-2 px-3 h-full hover:bg-[#2c3338] hover:text-[#72aee6]"
            onClick={() => setUserOpen(!userOpen)}
            onMouseEnter={() => setUserOpen(true)}
          >
            <span className="hidden sm:inline">Xin chào, {user}</span>
            <span className="w-[18px] h-[18px] rounded-sm bg-[#50575e] flex items-center justify-center text-[11px] font-bold uppercase">{user[0]}</span>
          </button>
          {userOpen && (
            <ul className="absolute right-0 top-full min-w-[180px] bg-[var(--wp-submenu)] py-1.5 shadow-lg">
              <li>
                <a href="/admin/decap/" className="block px-4 py-1.5 text-[#f0f0f1] no-underline hover:text-[#72aee6]">
                  Trình soạn cũ (Decap)
                </a>
              </li>
              <li>
                <button onClick={onLogout} className="flex items-center gap-2 w-full text-left px-4 py-1.5 hover:text-[#72aee6]">
                  <LogOut className="w-4 h-4" /> Đăng xuất
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>

      {/* Side menu */}
      <nav
        className={`fixed z-30 top-[46px] md:top-8 bottom-0 left-0 bg-[var(--wp-menu)] overflow-y-auto transition-transform ${
          collapsed ? 'md:w-9' : 'md:w-[160px]'
        } w-[190px] ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <ul className="pt-2.5">
          {extraItem('#dashboard', 'Bảng tin', LayoutDashboard, '#/')}
          <li className="h-3" aria-hidden />
          {items.map(renderItem)}
          <li className="h-3" aria-hidden />
          {extraItem('#volunteers', 'Tình nguyện viên', HeartHandshake, '#/volunteers')}
          {extraItem('#contacts', 'Liên hệ', Mail, '#/contacts')}
          <li>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-[#a7aaad] hover:text-[#72aee6]"
            >
              <CircleChevronLeft className={`w-5 h-5 shrink-0 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
              {!collapsed && 'Thu gọn menu'}
            </button>
          </li>
        </ul>
      </nav>
      {mobileOpen && <div className="md:hidden fixed inset-0 z-20 bg-black/40" onClick={() => setMobileOpen(false)} />}

      {/* Content */}
      <main className={`pt-[46px] md:pt-8 transition-[margin] ${collapsed ? 'md:ml-9' : 'md:ml-[160px]'}`}>
        <div className="px-3 sm:px-5 py-5 max-w-[1600px]">
          {notice && (
            <div className={`wp-notice mb-4 ${notice.type === 'error' ? 'wp-notice-error' : notice.type === 'info' ? 'wp-notice-info' : ''}`}>
              <div className="flex-1">{notice.text}</div>
              <button onClick={onDismissNotice} aria-label="Ẩn thông báo" className="text-[#787c82] hover:text-[#d63638]">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <PageErrorBoundary key={route.join('/')}>{children}</PageErrorBoundary>
        </div>
      </main>
    </div>
  );
}

/**
 * A page that crashes shows an error here instead of blanking the whole
 * admin, so the menu keeps working. Keyed by route: navigating away resets it.
 */
class PageErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('[admin]', error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="wp-notice wp-notice-error">
        <div>
          <strong>Trang này gặp lỗi và không hiển thị được.</strong> Bạn vẫn có thể chọn mục khác ở menu bên trái.
          <div className="mt-1 text-[12px] text-[var(--wp-muted)]">Chi tiết: {this.state.error.message}</div>
        </div>
      </div>
    );
  }
}

/** A WordPress page heading: title, plus an outlined "Thêm mới"-style button next to it. */
export function PageTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <h1 className="text-[23px] font-normal text-[#1d2327] m-0">{children}</h1>
      {action}
    </div>
  );
}

/** A collapsible WordPress metabox. */
export function MetaBox({
  title,
  children,
  defaultOpen = true,
  className = '',
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`wp-box ${className}`}>
      <button type="button" className="wp-box-title w-full text-left" style={open ? undefined : { borderBottom: 0 }} onClick={() => setOpen(!open)}>
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 text-[#787c82] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-3">{children}</div>}
    </div>
  );
}
