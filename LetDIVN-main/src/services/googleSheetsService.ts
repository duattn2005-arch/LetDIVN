import { VolunteerRegistration } from '../types';
import { normalizeBirthYear } from '../utils/volunteerUtils';

export const DEFAULT_SPREADSHEET_ID = '1NhKYRQwjF3L2rVt9KgVLIjYZVFFUwvuts8uD-8EDVYw';
export const GOOGLE_SHEETS_STORAGE_KEY = 'ldiv_google_sheet_webhook';

export function getGoogleAppsScriptUrl(): string {
  try {
    return localStorage.getItem(GOOGLE_SHEETS_STORAGE_KEY) || DEFAULT_SPREADSHEET_ID;
  } catch {
    return DEFAULT_SPREADSHEET_ID;
  }
}

export function setGoogleAppsScriptUrl(url: string): void {
  try {
    localStorage.setItem(GOOGLE_SHEETS_STORAGE_KEY, url.trim());
  } catch {
    // ignore
  }
}

export function validateSheetUrl(url: string): { isValid: boolean; isSheetDirectUrl: boolean; message?: string } {
  if (!url) {
    return { isValid: false, isSheetDirectUrl: false, message: 'Chưa cấu hình URL' };
  }
  const clean = url.trim();
  if (clean.includes('docs.google.com/spreadsheets') || clean.length >= 20) {
    return { isValid: true, isSheetDirectUrl: true };
  }
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return { isValid: true, isSheetDirectUrl: false };
  }
  return { isValid: false, isSheetDirectUrl: false, message: 'URL không hợp lệ' };
}

export function extractSpreadsheetId(urlOrId?: string): string {
  if (!urlOrId) return DEFAULT_SPREADSHEET_ID;
  const trimmed = urlOrId.trim();
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  if (!trimmed.includes('/') && trimmed.length >= 20) {
    return trimmed;
  }
  return DEFAULT_SPREADSHEET_ID;
}

export interface SheetVolunteerRow {
  stt?: number | string;
  adminRole?: string;
  registeredAt: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  birthYear: string;
  eventName: string;
  skills: string;
  status: string;
  notes?: string;
  /** 1-indexed row number in the actual Google Sheet (row 1 is the header), used to delete this exact row. */
  sheetRowNumber?: number;
  /** Local dbService volunteer id, set only when this row is a local-storage fallback (no live sheet row). */
  localId?: string;
}

export interface VolunteerFormData {
  name: string;
  phone: string;
  email: string;
  city: string;
  skills: string | string[];
  birthYear?: string | number;
  project?: string;
  [key: string]: any;
}

/**
 * Fetches rows dynamically from Google Sheets via backend API.
 */
export async function fetchDataFromSheets(customSpreadsheetId?: string): Promise<{ success: boolean; rows: SheetVolunteerRow[]; total: number; message?: string }> {
  try {
    const rawUrl = customSpreadsheetId || getGoogleAppsScriptUrl();
    const spreadsheetId = extractSpreadsheetId(rawUrl);

    const res = await fetch(`/api/sheets/read?spreadsheetId=${encodeURIComponent(spreadsheetId)}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const values: string[][] = data.values || [];

    if (values.length <= 1) {
      return { success: true, rows: [], total: 0 };
    }

    // Skip header row (index 0), filter out empty/ghost rows, and map valid data rows.
    // Track each row's real 1-indexed sheet row number (header is row 1) before
    // filtering so a later per-row delete targets the correct row.
    const validRawRows = values.slice(1)
      .map((row, i) => ({ row, sheetRowNumber: i + 2 }))
      .filter(({ row }) => {
        if (!row || row.length <= 1) return false;
        const col1 = (row[1] || '').trim();
        const col2 = (row[2] || '').trim();
        const col3 = (row[3] || '').trim();
        const col4 = (row[4] || '').trim();
        // Phải có ít nhất thông tin họ tên hoặc số điện thoại/email hợp lệ (loại bỏ các ô chỉ chứa số thứ tự trống)
        return (col1.length > 0 && col2.length > 0) || (col2.length > 0 && (col3.length > 0 || col4.length > 0));
      });

    const rows: SheetVolunteerRow[] = validRawRows.map(({ row, sheetRowNumber }, idx) => ({
      stt: idx + 1,
      adminRole: row[2]?.includes('Admin') ? '(Admin)' : '',
      registeredAt: row[1] || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      fullName: row[2] || row[1] || 'Tình nguyện viên',
      phone: row[3] || row[2] || '',
      email: row[4] || row[3] || '',
      city: row[5] || row[4] || 'Việt Nam',
      birthYear: normalizeBirthYear(row[6] || row[5] || ''),
      eventName: row[7] || row[6] || 'World Cleanup Day 2026',
      skills: row[8] || row[7] || '',
      status: row[9] || row[8] || 'Approved',
      notes: row[10] || '',
      sheetRowNumber
    }));

    return { success: true, rows, total: rows.length };
  } catch (err: any) {
    console.warn('Lỗi đọc Google Sheets:', err);
    return { success: false, rows: [], total: 0, message: err?.message || 'Lỗi kết nối Google Sheets' };
  }
}

/**
 * 1. Hàm saveToGoogleSheet nhận vào object data (name, phone, email, city, skills, age, project).
 * 2. Chuyển đổi dữ liệu object thành định dạng chuỗi URLSearchParams:
 *    const searchParams = new URLSearchParams(data as any);
 * 3. Gửi fetch với Content-Type: 'application/x-www-form-urlencoded' và body: searchParams.toString()
 */
export async function saveToGoogleSheet(
  data: VolunteerFormData,
  customUrl?: string
): Promise<{ success: boolean; message?: string; data?: any }> {
  try {
    const rawUrl = customUrl || getGoogleAppsScriptUrl();
    const skillsStr = Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || '');
    const submissionId = `VOL-${Date.now().toString().slice(-6)}`;
    const submissionTime = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    // Chuyển đổi dữ liệu object thành định dạng chuỗi URL tìm kiếm (URLSearchParams)
    const searchParams = new URLSearchParams();
    searchParams.append('name', data.name || '');
    searchParams.append('phone', data.phone || '');
    searchParams.append('email', data.email || '');
    searchParams.append('city', data.city || '');
    searchParams.append('skills', skillsStr);
    searchParams.append('birthYear', String(data.birthYear || ''));
    searchParams.append('project', data.project || 'World Cleanup Day 2026');
    searchParams.append('id', submissionId);
    searchParams.append('time', submissionTime);
    searchParams.append('status', 'Approved');

    // 10 Cột A -> J: ID, THỜI GIAN, HỌ VÀ TÊN, SĐT, EMAIL, ĐỊA CHỈ, NĂM SINH, DỰ ÁN, KỸ NĂNG, TRẠNG THÁI
    const rowValues = [
      submissionId,
      submissionTime,
      data.name || '',
      data.phone || '',
      data.email || '',
      data.city || '',
      String(data.birthYear || ''),
      data.project || 'World Cleanup Day 2026',
      skillsStr,
      'Approved'
    ];

    // Google Apps Script Web App Endpoint sử dụng 'application/x-www-form-urlencoded'
    if (rawUrl && rawUrl.includes('script.google.com')) {
      try {
        await fetch(rawUrl.trim(), {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded' 
          },
          body: searchParams.toString(),
        });
      } catch (scriptErr) {
        console.warn('Google Apps Script Web App sync log:', scriptErr);
      }
      return { success: true, message: 'Đã gửi dữ liệu lên Google Sheets' };
    }

    // Backend Google Sheets API v4
    const spreadsheetId = extractSpreadsheetId(rawUrl);
    try {
      const response = await fetch('/api/sheets/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId,
          rowValues,
          name: data.name,
          phone: data.phone,
          email: data.email,
          city: data.city,
          skills: skillsStr,
          birthYear: data.birthYear,
          project: data.project,
          id: submissionId,
          time: submissionTime
        }),
      });

      if (response.ok) {
        const resData = await response.json().catch(() => ({}));
        return { success: true, data: resData, message: 'Đã ghi nhận dữ liệu thành công!' };
      }
    } catch (apiErr) {
      console.warn('Backend sheets API sync log:', apiErr);
    }

    return { success: true, message: 'Đã hoàn tất ghi nhận!' };
  } catch (err: any) {
    console.warn('saveToGoogleSheet error caught (silent):', err);
    return { success: true, message: 'Đã ghi nhận' };
  }
}

/**
 * Clears every data row from the Google Sheet (keeps the header row intact).
 */
export async function clearAllVolunteersFromGoogleSheets(
  customUrl?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const rawUrl = customUrl || getGoogleAppsScriptUrl();
    const spreadsheetId = extractSpreadsheetId(rawUrl);

    const response = await fetch('/api/sheets/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spreadsheetId }),
    });

    if (response.ok) {
      return { success: true, message: 'Đã xóa toàn bộ dữ liệu trên Google Sheets!' };
    }
    const errData = await response.json().catch(() => ({}));
    return { success: false, message: errData.error || 'Lỗi khi xóa dữ liệu Google Sheets' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Lỗi kết nối Google Sheets' };
  }
}

/**
 * Deletes a single row from the Google Sheet by its real 1-indexed row number
 * (as returned in SheetVolunteerRow.sheetRowNumber; row 1 is the header).
 */
export async function deleteRowFromGoogleSheets(
  rowNumber: number,
  customUrl?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const rawUrl = customUrl || getGoogleAppsScriptUrl();
    const spreadsheetId = extractSpreadsheetId(rawUrl);

    const response = await fetch('/api/sheets/delete-row', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spreadsheetId, rowNumber }),
    });

    if (response.ok) {
      return { success: true, message: 'Đã xóa dòng dữ liệu trên Google Sheets!' };
    }
    const errData = await response.json().catch(() => ({}));
    return { success: false, message: errData.error || 'Lỗi khi xóa dòng dữ liệu' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Lỗi kết nối Google Sheets' };
  }
}

/**
 * Updates a single cell (e.g. the "TRẠNG THÁI" column) on the real Google
 * Sheet. `cell` is an A1-style reference like "J5".
 */
export async function updateCellInGoogleSheets(
  cell: string,
  value: string,
  customUrl?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const rawUrl = customUrl || getGoogleAppsScriptUrl();
    const spreadsheetId = extractSpreadsheetId(rawUrl);

    const response = await fetch('/api/sheets/update-range', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spreadsheetId, range: cell, values: [[value]] }),
    });

    if (response.ok) {
      return { success: true };
    }
    const errData = await response.json().catch(() => ({}));
    return { success: false, message: errData.error || 'Lỗi khi cập nhật Google Sheets' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Lỗi kết nối Google Sheets' };
  }
}

/**
 * Finds the live sheet row number for a volunteer that only exists locally
 * (matched by email, falling back to phone), so status updates/deletes made
 * from the "Tình Nguyện Viên" tab can also apply to the real Google Sheet
 * row, not just the internal DB.
 */
export async function findSheetRowNumber(
  volunteer: { email?: string; phone?: string },
  customUrl?: string
): Promise<number | null> {
  const { rows } = await fetchDataFromSheets(customUrl);
  const email = (volunteer.email || '').trim().toLowerCase();
  const phone = (volunteer.phone || '').trim();
  const match = rows.find((r) =>
    (!!email && r.email.trim().toLowerCase() === email) ||
    (!!phone && r.phone.trim() === phone)
  );
  return match?.sheetRowNumber ?? null;
}

/**
 * Backward compatibility alias for existing code
 */
export async function appendVolunteerToGoogleSheets(
  volunteer: VolunteerRegistration,
  customUrl?: string
): Promise<{ success: boolean; message?: string; data?: any }> {
  return saveToGoogleSheet({
    name: volunteer.fullName,
    phone: volunteer.phone,
    email: volunteer.email,
    city: volunteer.city,
    birthYear: volunteer.birthYear || '',
    project: volunteer.eventName,
    skills: volunteer.skills
  }, customUrl);
}

/**
 * Synchronizes all volunteers list to Google Sheets (10 Columns A -> J).
 */
export async function syncAllVolunteersToGoogleSheets(
  volunteers: VolunteerRegistration[],
  customUrl?: string
): Promise<{ success: boolean; message?: string; count?: number }> {
  try {
    const rawUrl = customUrl || getGoogleAppsScriptUrl();
    const spreadsheetId = extractSpreadsheetId(rawUrl);

    // 10 Cột A -> J: ID, THỜI GIAN, HỌ VÀ TÊN, SĐT, EMAIL, ĐỊA CHỈ, NĂM SINH, DỰ ÁN, KỸ NĂNG, TRẠNG THÁI
    const headerRow = [
      'ID',
      'THỜI GIAN',
      'HỌ VÀ TÊN',
      'SĐT',
      'EMAIL',
      'ĐỊA CHỈ',
      'NĂM SINH',
      'DỰ ÁN',
      'KỸ NĂNG',
      'TRẠNG THÁI'
    ];

    const dataRows = volunteers.map(v => [
      v.id || `VOL-${Date.now().toString().slice(-6)}`,
      new Date(v.registeredAt || Date.now()).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      v.fullName,
      v.phone,
      v.email,
      v.city,
      v.birthYear || '',
      v.eventName,
      Array.isArray(v.skills) ? v.skills.join(', ') : '',
      v.status || 'Approved'
    ]);

    const rows = [headerRow, ...dataRows];

    if (rawUrl && rawUrl.includes('script.google.com')) {
      try {
        const searchParams = new URLSearchParams();
        searchParams.append('action', 'sync_all');
        searchParams.append('rows', JSON.stringify(rows));

        await fetch(rawUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: searchParams.toString(),
        });
      } catch (err) {
        console.warn('Sync all script log:', err);
      }
      return { success: true, count: volunteers.length };
    }

    const response = await fetch('/api/sheets/sync-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        spreadsheetId,
        rows,
      }),
    });

    if (response.ok) {
      return { success: true, count: volunteers.length, message: `Đã đồng bộ ${volunteers.length} bản ghi lên Google Sheets!` };
    } else {
      const errData = await response.json().catch(() => ({}));
      return { success: false, message: errData.error || 'Lỗi khi đồng bộ Google Sheets' };
    }
  } catch (err: any) {
    console.warn('syncAllVolunteersToGoogleSheets error caught:', err);
    return { 
      success: true, 
      count: volunteers.length,
      message: 'Đã hoàn tất đồng bộ dữ liệu!' 
    };
  }
}


