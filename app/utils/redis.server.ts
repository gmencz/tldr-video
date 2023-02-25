import Redis from "ioredis";

const { REDIS_HOST, REDIS_PASSWORD } = process.env;
if (typeof REDIS_HOST !== "string") {
  throw new Error("REDIS_HOST environment variable not set");
}

if (typeof REDIS_PASSWORD !== "string") {
  throw new Error("REDIS_PASSWORD environment variable not set");
}

export const redis = new Redis({
  host: process.env.REDIS_HOST,
  family: process.env.NODE_ENV === "production" ? 6 : undefined,
  password: process.env.REDIS_PASSWORD,
});
