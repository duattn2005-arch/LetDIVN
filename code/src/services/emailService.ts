import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;

export function isEmailServiceConfigured(): boolean {
  return Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY);
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
      message: 'Email sending is not configured. Please add VITE_EMAILJS_SERVICE_ID / VITE_EMAILJS_TEMPLATE_ID / VITE_EMAILJS_PUBLIC_KEY to the .env file (see the instructions in .env.example).'
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
      message: err?.text || err?.message || 'Unable to send the email. Please check your EmailJS configuration.'
    };
  }
}


