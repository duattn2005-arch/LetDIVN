// Client-side password hashing (Web Crypto SHA-256, salted). This is best-effort
// only — there is no backend in this app, so a determined attacker with access to
// the visitor's own browser storage could still read the hash. It exists so the
// login form actually checks passwords instead of accepting any value.

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateSalt(): string {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return bytesToHex(arr.buffer);
}

export async function hashWithSalt(value: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${value}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(digest);
}

/** Random 6-digit numeric code, e.g. "042917". */
export function generateResetCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return n.toString().padStart(6, '0');
}


