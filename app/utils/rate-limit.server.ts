import { redis } from "./redis.server";

interface RateLimiterConfig {
  max: number;
  windowInSeconds: number;
  uid?: string;
}

export async function isOverLimit(request: Request, config: RateLimiterConfig) {
  const url = new URL(request.url);
  const id =
    process.env.NODE_ENV === "production"
      ? request.headers.get("Fly-Client-IP")
      : "127.0.0.1";

  const key = `rate-limiter:${config.uid || url.pathname}:${id}`;
  let res: number;
  try {
    res = await redis.incr(key);
  } catch (err) {
    console.error("isOverLimit: could not increment key");
    throw err;
  }

  if (res > config.max) {
    return true;
  }

  if (res === 1) {
    redis.expire(key, config.windowInSeconds);
  }

  return false;
}
