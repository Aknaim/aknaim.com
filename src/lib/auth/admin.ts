import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";
/** Solo admin panel: same-day session; re-login beats a long-lived cookie. */
const MAX_AGE_SECONDS = 60 * 60 * 8;

function getSecret() {
  return process.env.SESSION_SECRET ?? process.env.ADMIN_PASSWORD ?? "dev-secret";
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createAdminSessionToken(): string {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  const expected = sign(issuedAt);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }

  const ageMs = Date.now() - Number(issuedAt);
  return Number.isFinite(ageMs) && ageMs >= 0 && ageMs < MAX_AGE_SECONDS * 1000;
}

export function verifyAdminPassword(password: string): boolean {
  // Trim both sides; .env values sometimes pick up trailing whitespace.
  // If the password contains `#`, quote it in `.env` (e.g. ADMIN_PASSWORD="p@ss#").
  const expected = (process.env.ADMIN_PASSWORD ?? "changeme").trim();
  const a = Buffer.from(password.trim());
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function getAdminCookieName() {
  return COOKIE_NAME;
}

export function getAdminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}
