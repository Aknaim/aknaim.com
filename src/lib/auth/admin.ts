import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";
/** Solo admin panel: same-day session; re-login beats a long-lived cookie. */
const MAX_AGE_SECONDS = 60 * 60 * 8;

const MIN_PROD_PASSWORD_LEN = 12;
const MIN_PROD_SESSION_SECRET_LEN = 24;

function isProduction() {
  return process.env.NODE_ENV === "production";
}

/**
 * HMAC key for admin_session cookies.
 * Production: SESSION_SECRET required (no ADMIN_PASSWORD / "dev-secret" fallback).
 * Local: SESSION_SECRET → ADMIN_PASSWORD → "dev-secret".
 */
function getSessionSecret(): string | null {
  const session = process.env.SESSION_SECRET?.trim();
  if (session) {
    if (
      isProduction() &&
      (session.length < MIN_PROD_SESSION_SECRET_LEN || session === "dev-secret")
    ) {
      return null;
    }
    return session;
  }

  if (isProduction()) return null;
  return process.env.ADMIN_PASSWORD?.trim() || "dev-secret";
}

/**
 * Expected admin password.
 * Production: ADMIN_PASSWORD required; rejects missing / short / "changeme".
 * Local: ADMIN_PASSWORD → "changeme".
 */
function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (password) {
    if (
      isProduction() &&
      (password.length < MIN_PROD_PASSWORD_LEN || password === "changeme")
    ) {
      return null;
    }
    return password;
  }

  if (isProduction()) return null;
  return "changeme";
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createAdminSessionToken(): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured for production");
  }
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt, secret)}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  const secret = getSessionSecret();
  if (!secret || !token) return false;

  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;

  const expected = sign(issuedAt, secret);
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
  const expected = getAdminPassword();
  if (!expected) return false;

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
