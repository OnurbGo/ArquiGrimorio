import { Request, Response } from "express";
import { createClient } from "redis";

const client = createClient({ url: process.env.REDIS_URL });
client.connect().catch(()=>{});

export const listAdminNotifications = async (req: Request, res: Response) => {
  const isAdmin = (req as any).user?.admin;
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });
  try {
    const raw = await client.lRange("admin:notifications", 0, -1);
    const items = raw.map(r => {
      try { return JSON.parse(r); } catch { return null; }
    }).filter(Boolean);
    return res.json(items);
  } catch (e) {
    console.error("listAdminNotifications error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};