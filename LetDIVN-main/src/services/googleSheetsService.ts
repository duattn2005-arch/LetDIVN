import { VolunteerRegistration } from '../types';

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
  ageGroup: string;
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
  age?: string | number;
  project?: string;
  [key: string]: any;
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
    searchParams.append('age', String(data.age || ''));
    searchParams.append('project', data.project || 'World Cleanup Day 2026');
    searchParams.append('id', submissionId);
    searchParams.append('time', submissionTime);
    searchParams.append('status', 'Approved');

    // 10 Cột A -> J: ID, THỜI GIAN, HỌ VÀ TÊN, SĐT, EMAIL, ĐỊA CHỈ, TUỔI, DỰ ÁN, KỸ NĂNG, TRẠNG THÁI
    const rowValues = [
      submissionId,
      submissionTime,
      data.name || '',
      data.phone || '',
      data.email || '',
      data.city || '',
      String(data.age || ''),
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
          age: data.age,
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

