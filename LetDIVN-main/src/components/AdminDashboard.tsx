import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Database,
  Users,
  Calendar,
  FileText,
  Building2,
  Plus,
  Trash2,
  Edit3,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  Filter,
  BarChart3,
  Sparkles,
  FileSpreadsheet,
  Copy,
  ExternalLink,
  Check,
  Link as LinkIcon,
  Loader2,
  KeyRound,
  ShieldCheck,
  ShieldOff
} from 'lucide-react';
import { normalizeBirthYear } from '../utils/volunteerUtils';
import { dbService } from '../services/dbService';
import {
  VolunteerRegistration,
  CleanupEvent,
  NewsArticle,
  Partner,
  GalleryItem,
  UserProfile
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_VOLUNTEERS,
  INITIAL_EVENTS,
  INITIAL_NEWS,
  INITIAL_PARTNERS,
  INITIAL_GALLERY
} from '../data/initialData';
import {
  fetchDataFromSheets,
  syncAllVolunteersToGoogleSheets,
  clearAllVolunteersFromGoogleSheets,
  validateSheetUrl,
  getGoogleAppsScriptUrl,
  SheetVolunteerRow,
  DEFAULT_SPREADSHEET_ID
} from '../services/googleSheetsService';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'sheets' | 'accounts' | 'volunteers' | 'events' | 'news' | 'partners' | 'overview';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('sheets');
  const [copiedSheet, setCopiedSheet] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [isLoadingLiveSheets, setIsLoadingLiveSheets] = useState(false);
  const [liveSheetRows, setLiveSheetRows] = useState<SheetVolunteerRow[]>([]);
  const [syncResultMsg, setSyncResultMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [appScriptUrl, setAppScriptUrl] = useState(localStorage.getItem('ldiv_google_sheet_webhook') || DEFAULT_SPREADSHEET_ID);
  const [savedUrlMsg, setSavedUrlMsg] = useState(false);
  const [isClearingSheet, setIsClearingSheet] = useState(false);

  // Database state lists initialized with real seed data
  const [users, setUsers] = useState<(UserProfile & { hasPassword: boolean })[]>(() =>
    INITIAL_USERS.map((u) => ({ ...u, hasPassword: true }))
  );
  const [volunteers, setVolunteers] = useState<VolunteerRegistration[]>(() => INITIAL_VOLUNTEERS);
  const [events, setEvents] = useState<CleanupEvent[]>(() => INITIAL_EVENTS);
  const [news, setNews] = useState<NewsArticle[]>(() => INITIAL_NEWS);
  const [partners, setPartners] = useState<Partner[]>(() => INITIAL_PARTNERS);
  const [gallery, setGallery] = useState<GalleryItem[]>(() => INITIAL_GALLERY);
  const [stats, setStats] = useState<Awaited<ReturnType<typeof dbService.getStats>> | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');

  // Modal forms for adding items
  const [isCreatingVolunteer, setIsCreatingVolunteer] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isCreatingNews, setIsCreatingNews] = useState(false);
  const [refreshToast, setRefreshToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [grantedAdmins, setGrantedAdmins] = useState<string[]>([]);
  const [grantingEmail, setGrantingEmail] = useState<string | null>(null);

  const handleManualRefresh = async () => {
    if (isManualRefreshing) return;
    setIsManualRefreshing(true);
    setRefreshToast({ message: 'Refreshing data...' });
    const minSpinPromise = new Promise(resolve => setTimeout(resolve, 1000));
    try {
      await Promise.all([refreshData(), minSpinPromise]);
      setRefreshToast({ message: '✓ All data refreshed successfully!', isError: false });
    } catch (err: any) {
      await minSpinPromise;
      setRefreshToast({ message: '⚠ Refresh error: ' + (err?.message || 'Unable to connect'), isError: true });
    } finally {
      setIsManualRefreshing(false);
      setTimeout(() => {
        setRefreshToast(null);
      }, 3000);
    }
  };

  const refreshData = async () => {
    let freshVols = volunteers;
    try {
      const [usersRes, volsRes, eventsRes, newsRes, partnersRes, galleryRes, statsRes, grantedRes] = await Promise.allSettled([
        dbService.getUsers(),
        dbService.getVolunteers(),
        dbService.getEvents(),
        dbService.getNews(),
        dbService.getPartners(),
        dbService.getGallery(),
        dbService.getStats(),
        dbService.getGrantedAdminEmails(),
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value) {
        setUsers(usersRes.value);
      }
      if (grantedRes.status === 'fulfilled' && grantedRes.value) {
        setGrantedAdmins(grantedRes.value);
      }
      if (volsRes.status === 'fulfilled' && volsRes.value) {
        setVolunteers(volsRes.value);
        freshVols = volsRes.value;
      }
      if (eventsRes.status === 'fulfilled' && eventsRes.value) {
        setEvents(eventsRes.value);
      }
      if (newsRes.status === 'fulfilled' && newsRes.value) {
        setNews(newsRes.value);
      }
      if (partnersRes.status === 'fulfilled' && partnersRes.value) {
        setPartners(partnersRes.value);
      }
      if (galleryRes.status === 'fulfilled' && galleryRes.value) {
        setGallery(galleryRes.value);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value) {
        setStats(statsRes.value);
      }
    } catch {
      // ignore
    }

    // Fetch live rows from Google Sheets API
    setIsLoadingLiveSheets(true);
    try {
      const activeSheetUrl = appScriptUrl || getGoogleAppsScriptUrl();
      const sheetRes = await fetchDataFromSheets(activeSheetUrl);
      if (sheetRes.success && sheetRes.rows && sheetRes.rows.length > 0) {
        setLiveSheetRows(sheetRes.rows);
      } else {
        // Fallback to local volunteer list if sheet is currently empty
        setLiveSheetRows((freshVols.length > 0 ? freshVols : INITIAL_VOLUNTEERS).map((v, idx) => ({
          stt: idx + 1,
          adminRole: v.fullName?.includes('Admin') ? '(Admin)' : '',
          registeredAt: v.registeredAt ? new Date(v.registeredAt).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }) : '',
          fullName: v.fullName || '',
          phone: v.phone || '',
          email: v.email || '',
          city: v.city || '',
          birthYear: normalizeBirthYear(v.birthYear),
          eventName: v.eventName || '',
          skills: (Array.isArray(v.skills) ? v.skills.join(', ') : (v.skills || '')),
          status: v.status || 'Approved',
          notes: v.notes || ''
        })));
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingLiveSheets(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      const unsub = dbService.subscribe(refreshData);
      return () => unsub();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Account CRUD
  const handleDeleteAccount = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this account? Its saved password will also be deleted.')) {
      await dbService.deleteUser(id);
      refreshData();
    }
  };

  const handleGrantAdmin = async (name: string, email: string) => {
    if (!window.confirm(`Grant Admin access to "${name}" (${email})?\n\nThis account will see the Admin role starting from their next login.`)) return;
    setGrantingEmail(email);
    try {
      await dbService.grantAdmin(email);
      refreshData();
    } finally {
      setGrantingEmail(null);
    }
  };

  const handleRevokeAdmin = async (name: string, email: string) => {
    if (!window.confirm(`Revoke Admin access from "${name}" (${email})?\n\nThis account will return to a regular role starting from their next login.`)) return;
    setGrantingEmail(email);
    try {
      await dbService.revokeAdmin(email);
      refreshData();
    } finally {
      setGrantingEmail(null);
    }
  };

  // Volunteer CRUD
  const handleDeleteVolunteer = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this volunteer record from the database?')) {
      await dbService.deleteVolunteer(id);
      refreshData();
    }
  };

  const handleUpdateVolunteerStatus = async (id: string, status: VolunteerRegistration['status']) => {
    await dbService.updateVolunteer(id, { status });
    refreshData();
  };

  // Event CRUD
  const handleDeleteEvent = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await dbService.deleteEvent(id);
      refreshData();
    }
  };

  // News CRUD
  const handleDeleteNews = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      await dbService.deleteNews(id);
      refreshData();
    }
  };

  // Partner CRUD
  const handleDeletePartner = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      await dbService.deletePartner(id);
      refreshData();
    }
  };

  // CSV Export for Google Sheets & Excel (Bulletproof UTF-8 BOM)
  const exportVolunteersCSV = () => {
    const headers = ['No.', 'Role', 'Registered At', 'Full Name', 'Phone Number', 'Email', 'Address / City', 'Birth Year', 'Registered Campaign', 'Skills or Role', 'Status', 'Notes'];
    const rows = (liveSheetRows.length > 0 ? liveSheetRows : volunteers).map((v: any, idx) => [
      idx + 1,
      v.adminRole || '',
      new Date(v.registeredAt).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
      `"${(v.fullName || '').replace(/"/g, '""')}"`,
      `'${v.phone || ''}`,
      `"${(v.email || '').replace(/"/g, '""')}"`,
      `"${(v.city || '').replace(/"/g, '""')}"`,
      `"${normalizeBirthYear(v.birthYear)}"`,
      `"${(v.eventName || '').replace(/"/g, '""')}"`,
      `"${(Array.isArray(v.skills) ? v.skills.join(', ') : (v.skills || '')).replace(/"/g, '""')}"`,
      v.status || 'Approved',
      `"${(v.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Volunteer_List_LetDoIt_2026_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyGoogleSheetToClipboard = () => {
    const headers = ['No.', 'Registered At', 'Full Name', 'Phone Number', 'Email', 'Address / City', 'Birth Year', 'Registered Campaign', 'Skills / Role', 'Status', 'Notes'];
    const rows = (liveSheetRows.length > 0 ? liveSheetRows : volunteers).map((v: any, idx) => [
      idx + 1,
      new Date(v.registeredAt).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
      v.fullName,
      v.phone,
      v.email,
      v.city,
      normalizeBirthYear(v.birthYear),
      v.eventName,
      Array.isArray(v.skills) ? v.skills.join(', ') : (v.skills || ''),
      v.status || 'Approved',
      v.notes || ''
    ]);
    const tsvContent = [headers.join('\t'), ...rows.map(e => e.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent);
    setCopiedSheet(true);
    setTimeout(() => setCopiedSheet(false), 2500);
  };

  const saveAppScriptConfig = (url: string) => {
    const clean = url.trim();
    setAppScriptUrl(clean);
    localStorage.setItem('ldiv_google_sheet_webhook', clean);
    setSavedUrlMsg(true);
    setTimeout(() => setSavedUrlMsg(false), 2500);
    refreshData();
  };

  const handleSyncAllToGoogleSheets = async () => {
    setIsSyncingAll(true);
    setSyncResultMsg(null);
    try {
      const res = await syncAllVolunteersToGoogleSheets(volunteers, appScriptUrl);
      if (res.success) {
        setSyncResultMsg({ text: `✓ Successfully synced ${volunteers.length} rows to Google Sheets!` });
        refreshData();
      } else {
        setSyncResultMsg({ text: `⚠ ${res.message}`, isError: true });
      }
    } catch (err: any) {
      setSyncResultMsg({ text: `⚠ ${err?.message || 'Sync error'}`, isError: true });
    } finally {
      setIsSyncingAll(false);
      setTimeout(() => setSyncResultMsg(null), 5000);
    }
  };

  const handleClearAllSheetData = async () => {
    const confirmed = window.confirm(
      `You are about to PERMANENTLY DELETE all ${displayRows.length} rows of data in the live Google Sheet (only the header row will remain). This action CANNOT be undone. Continue?`
    );
    if (!confirmed) return;

    setIsClearingSheet(true);
    setSyncResultMsg(null);
    try {
      const res = await clearAllVolunteersFromGoogleSheets(appScriptUrl);
      if (res.success) {
        setSyncResultMsg({ text: '✓ All data on Google Sheets has been deleted!' });
        setLiveSheetRows([]);
        refreshData();
      } else {
        setSyncResultMsg({ text: `⚠ ${res.message}`, isError: true });
      }
    } catch (err: any) {
      setSyncResultMsg({ text: `⚠ ${err?.message || 'Error deleting data'}`, isError: true });
    } finally {
      setIsClearingSheet(false);
      setTimeout(() => setSyncResultMsg(null), 5000);
    }
  };

  const openAdminCustomSheetLink = () => {
    const id = appScriptUrl.includes('/d/') ? appScriptUrl : `https://docs.google.com/spreadsheets/d/${appScriptUrl}`;
    window.open(id, '_blank');
  };

  const displayRows = (liveSheetRows.length > 0
    ? liveSheetRows.slice().reverse()
    : volunteers.slice().reverse().map((v, idx) => ({
      stt: idx + 1,
      adminRole: v.fullName.includes('Admin') ? '(Admin)' : '',
      registeredAt: new Date(v.registeredAt).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
      fullName: v.fullName,
      phone: v.phone,
      email: v.email,
      city: v.city,
      birthYear: normalizeBirthYear(v.birthYear),
      eventName: v.eventName,
      skills: (v.skills || []).join(', '),
      status: v.status || 'Approved',
      notes: v.notes || ''
    })));

  const filteredVolunteers = volunteers.filter(v => {
    const matchesSearch =
      v.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.phone.includes(searchQuery) ||
      v.eventName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    const matchesCity = cityFilter === 'All' || v.city === cityFilter;
    return matchesSearch && matchesStatus && matchesCity;
  });

  if (!isOpen) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div
        className="relative bg-slate-950 text-slate-100 rounded-3xl max-w-6xl w-full h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Refresh Toast Banner */}
        {refreshToast && (
          <div className={`absolute top-18 right-6 z-[999999] px-4 py-2 rounded-xl shadow-2xl border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
            refreshToast.isError
              ? 'bg-red-900 border-red-500 text-red-100'
              : 'bg-emerald-900 border-emerald-500 text-emerald-100'
          }`}>
            <RefreshCw
              className={`w-3.5 h-3.5 ${isManualRefreshing || isLoadingLiveSheets ? 'animate-spin' : ''}`}
              style={isManualRefreshing || isLoadingLiveSheets ? { animation: 'spin 0.8s linear infinite' } : undefined}
            />
            <span>{refreshToast.message}</span>
          </div>
        )}

        {/* 1. Main header frame (elegant red/purple gradient) */}
        <div className="bg-gradient-to-r from-[#990033] via-[#6A0DAD] to-[#120E2E] px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-shrink-0 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-inner backdrop-blur-xs">
              <Database className="w-6 h-6 text-pink-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Database Admin System
                </h3>
                <span className="bg-[#FF2A85] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs tracking-wider border border-white/20">
                  ENTERPRISE DB V2.0
                </span>
              </div>
              <p className="text-xs text-white/85 font-medium mt-0.5">
                Let's do it! Vietnam • Centralized management of volunteers, campaigns, news &amp; resources
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              disabled={isManualRefreshing || isLoadingLiveSheets}
              title="Refresh data from the database & Google Sheets"
              className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-75 rounded-xl transition-all cursor-pointer border border-white/15 flex items-center justify-center"
            >
              <RefreshCw
                className={`w-4 h-4 ${isManualRefreshing || isLoadingLiveSheets ? 'animate-spin text-emerald-300' : ''}`}
                style={isManualRefreshing || isLoadingLiveSheets ? { animation: 'spin 0.8s linear infinite' } : undefined}
              />
            </button>
            <button
              id="close-db-admin-btn"
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-red-600/80 rounded-xl transition-colors cursor-pointer border border-white/15"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Navigation tabs (active tab highlighted in bright green) */}
        <div className="bg-slate-900 px-6 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-bold scrollbar-none flex-shrink-0">

          {/* TAB GOOGLE SHEETS */}
          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'sheets'
              ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400 font-extrabold'
              : 'text-emerald-400 hover:text-white hover:bg-emerald-950/60 border border-emerald-800/60'
              }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Google Sheets</span>
          </button>

          {/* TAB ACCOUNTS */}
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'accounts'
              ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400 font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Accounts</span>
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {users.length}
            </span>
          </button>

          {/* TAB VOLUNTEERS */}
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'volunteers'
              ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400 font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Volunteers</span>
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {volunteers.length}
            </span>
          </button>

          {/* TAB CLEANUP EVENTS */}
          <button
            onClick={() => setActiveTab('events')}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'events'
              ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400 font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Cleanup Events</span>
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {events.length}
            </span>
          </button>

          {/* TAB NEWS */}
          <button
            onClick={() => setActiveTab('news')}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'news'
              ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400 font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
          >
            <FileText className="w-4 h-4" />
            <span>News &amp; Press</span>
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {news.length}
            </span>
          </button>

          {/* TAB ESG PARTNERS */}
          <button
            onClick={() => setActiveTab('partners')}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'partners'
              ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400 font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
          >
            <Building2 className="w-4 h-4" />
            <span>ESG Partners</span>
            <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {partners.length}
            </span>
          </button>

          {/* TAB OVERVIEW & KPI */}
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400 font-extrabold'
              : 'text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Overview &amp; KPI</span>
          </button>
        </div>

        {/* TAB BODY CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-slate-950 text-slate-200">

          {/* TAB 0: GOOGLE SHEETS LIVE SPREADSHEET */}
          {activeTab === 'sheets' && (
            <div className="space-y-4">



              {/* 3. Secondary status bar (obfuscated Google Script URL) */}
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-xs flex flex-wrap items-center justify-end gap-3 shadow-md">

                {/* Obfuscated Google Script URL display */}
                <div className="flex items-center gap-2 flex-1 sm:flex-initial min-w-[280px]">
                  <LinkIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div className="flex-1 sm:w-72 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-emerald-400 font-mono text-[11px] truncate select-all">
                    https://google.com/macros/s/AKfycb.../exec
                  </div>
                  <button
                    onClick={openAdminCustomSheetLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    title="Open Google Sheet on Drive"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Sheet</span>
                  </button>
                  <button
                    onClick={handleClearAllSheetData}
                    disabled={isClearingSheet || displayRows.length === 0}
                    className="bg-red-700 hover:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                    title="Delete all data on the Google Sheet (keeps the header row)"
                  >
                    {isClearingSheet ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Clear All</span>
                  </button>
                </div>
              </div>

              {syncResultMsg && (
                <div className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${syncResultMsg.isError
                  ? 'bg-red-950/60 text-red-300 border border-red-800'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  }`}>
                  {syncResultMsg.text}
                </div>
              )}

              {/* 4. Main data table (with exact matching columns) */}
              <div className="bg-white rounded-2xl overflow-hidden border border-slate-300 shadow-2xl text-slate-900">

                {/* Table Grid Content */}
                <div className="overflow-x-auto max-h-[52vh] scrollbar-thin">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead className="bg-[#4472C4] text-white font-black border-b-2 border-[#2f5597] sticky top-0 z-10 select-none">
                      <tr>
                        <th className="py-2.5 px-3 border-r border-white/20 text-center w-14">
                          <span className="text-[10px] font-bold uppercase">No.</span>
                        </th>
                        <th className="py-2.5 px-3 border-r border-white/20 min-w-[140px] text-center">
                          <span className="text-[10px] font-bold uppercase">Time</span>
                        </th>
                        <th className="py-2.5 px-3 border-r border-white/20 min-w-[160px] text-center">
                          <span className="text-[10px] font-bold uppercase">Full Name</span>
                        </th>
                        <th className="py-2.5 px-3 border-r border-white/20 min-w-[120px] text-center">
                          <span className="text-[10px] font-bold uppercase">Phone</span>
                        </th>
                        <th className="py-2.5 px-3 border-r border-white/20 min-w-[170px] text-center">
                          <span className="text-[10px] font-bold uppercase">Email</span>
                        </th>
                        <th className="py-2.5 px-3 border-r border-white/20 min-w-[140px] text-center">
                          <span className="text-[10px] font-bold uppercase">Address</span>
                        </th>
                        <th className="py-2.5 px-3 border-r border-white/20 text-center min-w-[100px]">
                          <span className="text-[10px] font-bold uppercase">Birth Year</span>
                        </th>
                        <th className="py-2.5 px-3 border-r border-white/20 min-w-[210px] text-center">
                          <span className="text-[10px] font-bold uppercase">Campaign</span>
                        </th>
                        <th className="py-2.5 px-3 border-r border-white/20 min-w-[180px] text-center">
                          <span className="text-[10px] font-bold uppercase">Skills</span>
                        </th>
                        <th className="py-2.5 px-3 text-center min-w-[110px]">
                          <span className="text-[10px] font-bold uppercase">Status</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                      {displayRows.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-12 text-center text-slate-500 font-sans">
                            <div className="text-sm font-bold text-slate-700 mb-1">No rows in the spreadsheet yet</div>
                            <p className="text-xs text-slate-400">When members register, new data rows will automatically appear here!</p>
                          </td>
                        </tr>
                      ) : (
                        displayRows.map((v, idx) => (
                          <tr
                            key={idx}
                            className={`hover:bg-emerald-50/70 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/90'}`}
                          >
                            {/* Unnamed column: (Admin) or row number */}
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-bold bg-slate-100/70 text-slate-700">
                              <div>{idx + 1}</div>
                              {v.adminRole && (
                                <span className="text-[9px] text-[#E81A7F] font-extrabold block">
                                  {v.adminRole}
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 text-slate-600 text-center whitespace-nowrap">
                              {v.registeredAt}
                            </td>
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-bold font-sans text-slate-900">
                              {v.fullName}
                            </td>
                            {/* D: Phone (highlighted in bold blue) */}
                            <td className="py-2 px-3 border-r border-slate-200 text-center text-blue-700 font-bold font-mono">
                              {v.phone}
                            </td>
                            {/* E: Email */}
                            <td className="py-2 px-3 border-r border-slate-200 text-center text-slate-700">
                              {v.email}
                            </td>
                            {/* F: Address / Province */}
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-sans text-slate-800">
                              {v.city}
                            </td>
                            {/* G: Birth Year */}
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-bold text-slate-700">
                              {normalizeBirthYear(v.birthYear)}
                            </td>
                            {/* H: Project / Campaign (dark purple/pink) */}
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-sans font-semibold text-purple-800">
                              {v.eventName}
                            </td>
                            {/* I: Skills / Role */}
                            <td className="py-2 px-3 border-r border-slate-200 text-center font-sans text-slate-700">
                              {v.skills}
                            </td>
                            {/* J: Status (rounded green "Approved" badge) */}
                            <td className="py-2 px-3 text-center">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-sans bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs inline-block">
                                Approved
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB ACCOUNTS: LOGIN ACCOUNTS */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Passwords are stored as a one-way salted hash, so the system cannot display the original password — the "Password" column only shows whether an account has a password set or signs in via a social provider.
                </span>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Account</th>
                      <th className="py-3 px-4 font-semibold">Password</th>
                      <th className="py-3 px-4 font-semibold">Role</th>
                      <th className="py-3 px-4 font-semibold">Date Joined</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 px-4 text-center text-slate-500">
                          No accounts have been registered yet.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => {
                        const hasPassword = u.hasPassword;
                        const email = (u.email || '').trim().toLowerCase();
                        const isGranted = !!email && grantedAdmins.includes(email);
                        const isPendingAdmin = isGranted && u.role !== 'admin';
                        const isBusy = grantingEmail === email;
                        return (
                          <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-bold text-white">
                              <div>{u.name}</div>
                              <span className="text-[11px] text-slate-400 font-mono">{u.email || u.id}</span>
                            </td>
                            <td className="py-3 px-4">
                              {hasPassword ? (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  •••••••• (encrypted)
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                  Signed in via {u.provider === 'google' ? 'Google' : u.provider === 'facebook' ? 'Facebook' : u.provider}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-300 font-mono">
                              <div>{u.role}</div>
                              {isPendingAdmin && (
                                <span className="mt-1 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold font-sans bg-amber-100 text-amber-800 border border-amber-300">
                                  ⏳ Pending re-login to gain Admin access
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-slate-400">{u.joinedAt}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {email && (
                                  u.role === 'admin' || isGranted ? (
                                    <button
                                      onClick={() => handleRevokeAdmin(u.name, email)}
                                      disabled={isBusy}
                                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                      title="Revoke Admin access"
                                    >
                                      {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldOff className="w-3.5 h-3.5" />}
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleGrantAdmin(u.name, email)}
                                      disabled={isBusy}
                                      className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                      title="Grant Admin access"
                                    >
                                      {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                    </button>
                                  )
                                )}
                                <button
                                  onClick={() => handleDeleteAccount(u.id)}
                                  className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 rounded-lg transition-colors cursor-pointer"
                                  title="Delete account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 1: VOLUNTEERS */}
          {activeTab === 'volunteers' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search by name, email, phone, or campaign..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportVolunteersCSV}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Volunteer Name</th>
                      <th className="py-3 px-4 font-semibold">Contact Info</th>
                      <th className="py-3 px-4 font-semibold">Campaign &amp; Address</th>
                      <th className="py-3 px-4 font-semibold">Birth Year &amp; Skills</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredVolunteers.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-white">
                          <div>{v.fullName}</div>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {v.id}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          <div className="text-blue-400 font-bold">{v.phone}</div>
                          <div className="text-slate-400 text-[11px]">{v.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-pink-300">{v.eventName}</div>
                          <div className="text-slate-400 text-[11px]">{v.city}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <div className="font-bold text-emerald-400">{normalizeBirthYear(v.birthYear)}</div>
                          <div className="text-slate-400 text-[11px]">{(v.skills || []).join(', ')}</div>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={v.status}
                            onChange={(e) => handleUpdateVolunteerStatus(v.id, e.target.value as any)}
                            className="px-2 py-1 bg-slate-950 border border-emerald-600/60 rounded text-emerald-300 text-xs font-bold"
                          >
                            <option value="Approved">Approved</option>
                            <option value="Pending">Pending</option>
                            <option value="Checked-In">Checked-In</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteVolunteer(v.id)}
                            className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: EVENTS */}
          {activeTab === 'events' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h4 className="font-bold text-base text-white">Campaign &amp; Cleanup Spot List</h4>
                  <p className="text-xs text-slate-400">A total of {events.length} events across 63 provinces</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((evt) => (
                  <div key={evt.id} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-slate-400 font-mono">{evt.date} • {evt.time}</span>
                      </div>
                      <h5 className="font-bold text-base text-white">{evt.title}</h5>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{evt.description}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
                      <div>
                        <span>Registered: </span>
                        <strong className="text-emerald-400">{evt.registeredCount}</strong> / {evt.targetVolunteers} volunteers
                      </div>
                      <button
                        onClick={() => handleDeleteEvent(evt.id)}
                        className="p-1.5 bg-red-950/60 hover:bg-red-900 text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: NEWS */}
          {activeTab === 'news' && (
            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-base text-white">News &amp; Press Coverage About Us</h4>
              </div>
              <div className="space-y-3">
                {news.map((item) => (
                  <div key={item.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <img src={item.image} alt={item.title} className="w-16 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] text-pink-300 font-bold">{item.category} • {item.date}</span>
                        <h5 className="font-bold text-sm text-white truncate">{item.title}</h5>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNews(item.id)}
                      className="p-2 bg-red-950/60 hover:bg-red-900 text-red-400 rounded-xl transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PARTNERS */}
          {activeTab === 'partners' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partners.map((p) => (
                <div key={p.id} className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-start gap-4">
                  <img src={p.logo} alt={p.name} className="w-14 h-14 rounded-xl object-cover bg-slate-950" />
                  <div className="flex-1">
                    <span className="text-[10px] text-yellow-300 font-bold bg-yellow-950 px-2 py-0.5 rounded">{p.tier} Tier</span>
                    <h5 className="font-bold text-sm text-white mt-1">{p.name}</h5>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Volunteers</span>
                <div className="text-3xl font-black text-white mt-2">{volunteers.length}</div>
                <div className="text-xs text-emerald-400 mt-1">Synced live with Google Sheets</div>
              </div>
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">Active Campaigns</span>
                <div className="text-3xl font-black text-white mt-2">{events.length}</div>
                <div className="text-xs text-slate-400 mt-1">Across 63 provinces</div>
              </div>
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase">Partners</span>
                <div className="text-3xl font-black text-white mt-2">
                  {((partners.length > 0 ? partners.length : stats?.totalPartners) ?? 24).toLocaleString('en-US')}
                </div>
                <div className="text-xs text-emerald-400 mt-1">Businesses &amp; ESG organizations</div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>,
    document.body
  ) : null;
};


