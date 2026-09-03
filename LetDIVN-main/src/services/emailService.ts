import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;
const NOTIFY_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_NOTIFY_TEMPLATE_ID as string;

export function isEmailServiceConfigured(): boolean {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
}

export function isNotifyEmailConfigured(): boolean {
  return Boolean(SERVICE_ID && NOTIFY_TEMPLATE_ID && PUBLIC_KEY);
}

/**
 * Generic notification email (registration confirmations, schedule-change
 * alerts, etc.) — reuses the same EmailJS service/account as the password
 * reset flow but a separate template, since the reset template's copy is
 * specific to a {{code}}. The EmailJS template must read {{to_email}},
 * {{to_name}}, {{subject}} and {{message}}.
 */
export async function sendNotificationEmail(
  toEmail: string,
  toName: string,
  subject: string,
  message: string
): Promise<{ success: boolean; message?: string }> {
  if (!isNotifyEmailConfigured()) {
    return {
      success: false,
      message: 'Chức năng gửi email thông báo chưa được cấu hình (thiếu VITE_EMAILJS_NOTIFY_TEMPLATE_ID trong .env).'
    };
  }

  try {
    await emailjs.send(
      SERVICE_ID,
      NOTIFY_TEMPLATE_ID,
      { to_email: toEmail, to_name: toName || toEmail, subject, message },
      { publicKey: PUBLIC_KEY }
    );
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      message: err?.text || err?.message || 'Không thể gửi email thông báo.'
    };
  }
}

/**
 * Sends the password-reset code to the user's inbox via EmailJS (no backend needed).
 * The EmailJS template must read {{to_email}}, {{to_name}} and {{code}}.
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  toName: string,
  code: string
): Promise<{ success: boolean; message?: string }> {
  if (!isEmailServiceConfigured()) {
    return {
      success: false,
      message: 'Chức năng gửi email chưa được cấu hình. Vui lòng thêm VITE_EMAILJS_SERVICE_ID / VITE_EMAILJS_TEMPLATE_ID / VITE_EMAILJS_PUBLIC_KEY vào file .env (xem hướng dẫn trong .env.example).'
    };
  }

  try {
    await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      { to_email: toEmail, to_name: toName || toEmail, code },
      { publicKey: PUBLIC_KEY }
    );
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      message: err?.text || err?.message || 'Không thể gửi email. Vui lòng kiểm tra lại cấu hình EmailJS.'
    };
  }
}


