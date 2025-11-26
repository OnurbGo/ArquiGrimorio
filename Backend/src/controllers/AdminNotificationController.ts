import { Request, Response } from "express";
import { clearAdminNotifications, deleteAdminNotificationById } from "../utils/messageBus";
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

export async function deleteAllAdminNotifications(req: Request, res: Response) {
  try {
    const user = (req as any).user;
    if (!user?.admin) return res.status(403).json({ error: "Requer privilégio admin" });

    await clearAdminNotifications();
    return res.status(204).send();
  } catch (err) {
    console.error("deleteAllAdminNotifications error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export async function deleteAdminNotification(req: Request<{ id: string }>, res: Response) {
  const isAdmin = (req as any).user?.admin;
  if (!isAdmin) return res.status(403).json({ error: "Forbidden" });

  const id = Number(req.params.id);
  if (Number.isNaN(id)) return res.status(400).json({ error: "ID inválido" });

  const ok = await deleteAdminNotificationById(id);
  if (!ok) return res.status(404).json({ error: "Notificação não encontrada" });
  return res.status(204).send();
}