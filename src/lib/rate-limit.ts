import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Reusable rate limiting for auth endpoints, backed by Upstash Redis (REST API,
// serverless-compatible). Limiters are created lazily and cached by name+config
// so each call site gets its own sliding-window bucket without re-instantiating
// on every request.
//
// Fails OPEN: if the Upstash env vars are missing or a check throws (e.g. the
// service is down), the request is allowed through rather than blocking auth.

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const limiters = new Map<string, Ratelimit>();

function getLimiter(name: string, limit: number, window: `${number} ${"s" | "m" | "h" | "d"}`) {
  const key = `${name}:${limit}:${window}`;
  let limiter = limiters.get(key);
  if (!limiter) {
    if (!redis) return null;
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `ratelimit:${name}`,
    });
    limiters.set(key, limiter);
  }
  return limiter;
}

const OPEN_RESULT: RateLimitResult = { success: true, remaining: 1, reset: 0 };

/**
 * Check (and consume) a request against a sliding-window rate limit.
 *
 * @param name a short identifier for the limiter (e.g. "register", "login")
 * @param limit max attempts allowed within the window
 * @param window Upstash duration string, e.g. "15 m", "1 h"
 * @param identifier the key to limit by (e.g. IP, or `${ip}:${email}`)
 */
export async function checkRateLimit(
  name: string,
  limit: number,
  window: `${number} ${"s" | "m" | "h" | "d"}`,
  identifier: string,
): Promise<RateLimitResult> {
  const limiter = getLimiter(name, limit, window);
  if (!limiter) return OPEN_RESULT;

  try {
    const { success, remaining, reset } = await limiter.limit(identifier);
    return { success, remaining, reset };
  } catch (error) {
    console.error(`Rate limit check failed for "${name}":`, error);
    return OPEN_RESULT;
  }
}

/**
 * Extract the client IP from the `x-forwarded-for` header set by Vercel/proxies,
 * falling back to `x-real-ip`. Returns "unknown" when neither is present (e.g.
 * local dev without a proxy in front) so callers always have a usable string.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Build the `{ error, status, headers }` parts of a 429 response from a
 * rate-limit `reset` timestamp (ms epoch). Shared by every protected route so
 * the message and `Retry-After` header stay consistent.
 */
export function rateLimitedResponse(reset: number) {
  const secondsRemaining = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  const minutesRemaining = Math.max(1, Math.ceil(secondsRemaining / 60));
  return {
    error: `Too many attempts. Please try again in ${minutesRemaining} minute${minutesRemaining === 1 ? "" : "s"}.`,
    status: 429 as const,
    headers: {
      "Retry-After": String(secondsRemaining),
    },
  };
}
