/**
 * Soft per-isolate login throttle. Cloudflare Workers do not share memory across
 * isolates, so pair this with a WAF rate rule on `/admin/login` for real limits.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type Bucket = { count: number; resetAt: number };

const attempts = new Map<string, Bucket>();

export function loginClientKey(headerList: Headers): string {
  const cf = headerList.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  return "unknown";
}

/** Returns true when this attempt should be rejected. */
export function consumeLoginAttempt(key: string): boolean {
  const now = Date.now();
  const existing = attempts.get(key);

  if (!existing || now >= existing.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  existing.count += 1;
  return existing.count > MAX_ATTEMPTS;
}

export function clearLoginAttempts(key: string): void {
  attempts.delete(key);
}
