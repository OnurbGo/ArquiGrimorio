import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redisClient.on("error", (err) => console.error("Redis error:", err));
redisClient.on("connect", () => console.log("[Redis] connected"));
redisClient.on("reconnecting", () => console.log("[Redis] reconnecting"));
redisClient.on("end", () => console.log("[Redis] connection closed"));

async function ensureConnect() {
  if (!redisClient.isOpen) {
    try {
      await redisClient.connect();
    } catch (err) {
      console.error("Redis connect failed:", err);
    }
  }
}

export async function redisGet(key: string): Promise<string | null> {
  try {
    await ensureConnect();
    return await redisClient.get(key);
  } catch (err) {
    console.error("redisGet error:", err);
    return null;
  }
}

export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<void> {
  try {
    await ensureConnect();
    if (ttlSeconds) {
      await redisClient.set(key, value, { EX: ttlSeconds });
    } else {
      await redisClient.set(key, value);
    }
  } catch (err) {
    console.error("redisSet error:", err);
  }
}

export async function redisDel(key: string): Promise<void> {
  try {
    await ensureConnect();
    await redisClient.del(key);
  } catch (err) {
    console.error("redisDel error:", err);
  }
}

export default redisClient;