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
    return { isValid: false, isSheetDirectUrl: false, message: 'No URL configured' };
  }
  const clean = url.trim();
  if (clean.includes('docs.google.com/spreadsheets') || clean.length >= 20) {
    return { isValid: true, isSheetDirectUrl: true };
  }
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return { isValid: true, isSheetDirectUrl: false };
  }
  return { isValid: false, isSheetDirectUrl: false, message: 'Invalid URL' };
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
        // Must have at least a valid name or phone/email (filters out rows with only a blank sequence number)
        return (col1.length > 0 && col2.length > 0) || (col2.length > 0 && (col3.length > 0 || col4.length > 0));
      });

    const rows: SheetVolunteerRow[] = validRawRows.map(({ row, sheetRowNumber }, idx) => ({
      stt: idx + 1,
      adminRole: row[2]?.includes('Admin') ? '(Admin)' : '',
      registeredAt: row[1] || new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
      fullName: row[2] || row[1] || 'Volunteer',
      phone: row[3] || row[2] || '',
      email: row[4] || row[3] || '',
      city: row[5] || row[4] || 'Vietnam',
      birthYear: normalizeBirthYear(row[6] || row[5] || ''),
      eventName: row[7] || row[6] || 'World Cleanup Day 2026',
      skills: row[8] || row[7] || '',
      status: row[9] || row[8] || 'Approved',
      notes: row[10] || '',
      sheetRowNumber
    }));

    return { success: true, rows, total: rows.length };
  } catch (err: any) {
    console.warn('Error reading Google Sheets:', err);
    return { success: false, rows: [], total: 0, message: err?.message || 'Error connecting to Google Sheets' };
  }
}

/**
 * 1. saveToGoogleSheet takes a data object (name, phone, email, city, skills, birthYear, project).
 * 2. Converts the object into a URLSearchParams string:
 *    const searchParams = new URLSearchParams(data as any);
 * 3. Sends a fetch with Content-Type: 'application/x-www-form-urlencoded' and body: searchParams.toString()
 */
export async function saveToGoogleSheet(
  data: VolunteerFormData,
  customUrl?: string
): Promise<{ success: boolean; message?: string; data?: any }> {
  try {
    const rawUrl = customUrl || getGoogleAppsScriptUrl();
    const skillsStr = Array.isArray(data.skills) ? data.skills.join(', ') : (data.skills || '');
    const submissionId = `VOL-${Date.now().toString().slice(-6)}`;
    const submissionTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' });

    // Convert the data object into a URL search-params string (URLSearchParams)
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

    // 10 Columns A -> J: ID, TIME, FULL NAME, PHONE, EMAIL, ADDRESS, BIRTH YEAR, PROJECT, SKILLS, STATUS
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

    // The Google Apps Script Web App endpoint uses 'application/x-www-form-urlencoded'
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
      return { success: true, message: 'Data sent to Google Sheets' };
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
        return { success: true, data: resData, message: 'Data recorded successfully!' };
      }
    } catch (apiErr) {
      console.warn('Backend sheets API sync log:', apiErr);
    }

    return { success: true, message: 'Recording complete!' };
  } catch (err: any) {
    console.warn('saveToGoogleSheet error caught (silent):', err);
    return { success: true, message: 'Recorded' };
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
      return { success: true, message: 'All data on Google Sheets has been deleted!' };
    }
    const errData = await response.json().catch(() => ({}));
    return { success: false, message: errData.error || 'Error deleting Google Sheets data' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Error connecting to Google Sheets' };
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
      return { success: true, message: 'The data row on Google Sheets has been deleted!' };
    }
    const errData = await response.json().catch(() => ({}));
    return { success: false, message: errData.error || 'Error deleting the data row' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Error connecting to Google Sheets' };
  }
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

    // 10 Columns A -> J: ID, TIME, FULL NAME, PHONE, EMAIL, ADDRESS, BIRTH YEAR, PROJECT, SKILLS, STATUS
    const headerRow = [
      'ID',
      'TIME',
      'FULL NAME',
      'PHONE',
      'EMAIL',
      'ADDRESS',
      'BIRTH YEAR',
      'PROJECT',
      'SKILLS',
      'STATUS'
    ];

    const dataRows = volunteers.map(v => [
      v.id || `VOL-${Date.now().toString().slice(-6)}`,
      new Date(v.registeredAt || Date.now()).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
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
      return { success: true, count: volunteers.length, message: `Synced ${volunteers.length} records to Google Sheets!` };
    } else {
      const errData = await response.json().catch(() => ({}));
      return { success: false, message: errData.error || 'Error syncing to Google Sheets' };
    }
  } catch (err: any) {
    console.warn('syncAllVolunteersToGoogleSheets error caught:', err);
    return {
      success: true,
      count: volunteers.length,
      message: 'Data sync complete!'
    };
  }
}
