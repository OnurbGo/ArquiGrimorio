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
    console.log("[Redis] ensureConnect -> conectando...");
    try {
      await redisClient.connect();
      console.log("[Redis] ensureConnect -> conectado");
    } catch (err) {
      console.error("Redis connect failed:", err);
    }
  }
}

export async function redisGet(key: string): Promise<string | null> {
  console.log(`[Redis] GET ${key}`);
  try {
    await ensureConnect();
    const val = await redisClient.get(key);
    console.log(
      `[Redis] GET resultado key=${key} hit=${val !== null ? "sim" : "não"}`
    );
    return val;
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
  console.log(
    `[Redis] SET ${key} value=${value} ttl=${ttlSeconds ?? "none"}`
  );
  try {
    await ensureConnect();
    if (ttlSeconds) {
      await redisClient.set(key, value, { EX: ttlSeconds });
    } else {
      await redisClient.set(key, value);
    }
    console.log(`[Redis] SET concluído para key=${key}`);
  } catch (err) {
    console.error("redisSet error:", err);
  }
}

export async function redisDel(key: string): Promise<void> {
  console.log(`[Redis] DEL ${key}`);
  try {
    await ensureConnect();
    await redisClient.del(key);
    console.log(`[Redis] DEL concluído key=${key}`);
  } catch (err) {
    console.error("redisDel error:", err);
  }
}

export default redisClient;