import Redis from "ioredis";

const { REDIS_URL } = process.env;
if (typeof REDIS_URL !== "string") {
  throw new Error("REDIS_URL environment variable not set");
}

export const redis = new Redis(REDIS_URL);
