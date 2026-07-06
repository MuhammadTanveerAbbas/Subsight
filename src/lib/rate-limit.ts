import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const ratelimiters = new Map<string, Ratelimit>();

function getRatelimiter(key: string, limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${key}:${limit}:${windowMs}`;
  let rl = ratelimiters.get(cacheKey);
  if (!rl) {
    const redis = getRedis();
    if (redis) {
      rl = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
        ephemeralCache: new Map(),
        analytics: true,
        prefix: `ratelimit:${key}`,
      });
    } else {
      rl = createFallback(limit, windowMs);
    }
    ratelimiters.set(cacheKey, rl);
  }
  return rl;
}

const fallbackMap = new Map<string, { count: number; reset: number }>();

function createFallback(limit: number, windowMs: number): Ratelimit {
  return {
    limit: async (identifier: string) => {
      const now = Date.now();
      const record = fallbackMap.get(identifier);
      if (record && now < record.reset && record.count >= limit) {
        return { success: false, limit, remaining: 0, reset: record.reset };
      }
      if (!record || now > record.reset) {
        fallbackMap.set(identifier, { count: 1, reset: now + windowMs });
        return { success: true, limit, remaining: limit - 1, reset: now + windowMs };
      }
      record.count++;
      return { success: true, limit, remaining: limit - record.count, reset: record.reset };
    },
  } as Ratelimit;
}

export async function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowMs: number = 60000,
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const rl = getRatelimiter("default", limit, windowMs);
  return rl.limit(identifier);
}
