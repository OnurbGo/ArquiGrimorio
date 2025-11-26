import { createClient } from "redis";
import UserModel from "../models/UserModel";

const CHANNEL_ITEM_CREATED = "item.created";
const CHANNEL_ITEM_DELETED = "item.deleted";
const CHANNEL_ITEM_UPDATED = "item.updated"; // novo

// Publisher (reusa conexão simples)
const pubClient = createClient({ url: process.env.REDIS_URL });
pubClient.connect().catch(err => console.error("Redis pub connect error:", err));

// Subscriber (precisa conexão separada)
const subClient = createClient({ url: process.env.REDIS_URL });
subClient.connect().catch(err => console.error("Redis sub connect error:", err));

export async function publishItemCreated(payload: {
  id: number;
  name: string;
  user_id: number;
}) {
  try {
    await pubClient.publish(CHANNEL_ITEM_CREATED, JSON.stringify(payload));
  } catch (e) {
    console.error("publishItemCreated error:", e);
  }
}

export async function publishItemDeleted(payload: {
  id: number;
  name: string;
  user_id: number;
}) {
  try {
    await pubClient.publish(CHANNEL_ITEM_DELETED, JSON.stringify(payload));
  } catch (e) {
    console.error("publishItemDeleted error:", e);
  }
}

export async function publishItemUpdated(payload: {
  id: number;
  name?: string;
  user_id: number;
  changes?: Record<string, { from: unknown; to: unknown }>;
}) {
  try {
    await pubClient.publish(CHANNEL_ITEM_UPDATED, JSON.stringify(payload));
  } catch (e) {
    console.error("publishItemUpdated error:", e);
  }
}

// Inicializa assinante
export async function initItemCreatedSubscriber() {
  try {
    await subClient.subscribe(CHANNEL_ITEM_CREATED, async (message) => {
      try {
        const data = JSON.parse(message);
        const admins = await UserModel.findAll({ where: { admin: true } });
        if (!admins.length) return;
        const notif = {
          id: await pubClient.incr(ADMIN_NOTIFICATIONS_SEQ_KEY), // novo ID
          type: "ITEM_CREATED",
          item_id: data.id,
          item_name: data.name,
          creator_user_id: data.user_id,
          timestamp: Date.now()
        };
        const key = ADMIN_NOTIFICATIONS_KEY;
        await pubClient.rPush(key, JSON.stringify(notif));
        await pubClient.lTrim(key, -100, -1);
        console.log("[Mensagem] Notificação enviada a admins:", notif);
      } catch (err) {
        console.error("Subscriber handler error:", err);
      }
    });

    await subClient.subscribe(CHANNEL_ITEM_DELETED, async (message) => {
      try {
        const data = JSON.parse(message);
        const admins = await UserModel.findAll({ where: { admin: true } });
        if (!admins.length) return;
        const notif = {
          id: await pubClient.incr(ADMIN_NOTIFICATIONS_SEQ_KEY), // novo ID
          type: "ITEM_DELETED",
          item_id: data.id,
          item_name: data.name,
          deleter_user_id: data.user_id,
          timestamp: Date.now()
        };
        const key = ADMIN_NOTIFICATIONS_KEY;
        await pubClient.rPush(key, JSON.stringify(notif));
        await pubClient.lTrim(key, -100, -1);
        console.log("[Mensagem] Notificação de exclusão enviada a admins:", notif);
      } catch (err) {
        console.error("Subscriber deletion handler error:", err);
      }
    });

    await subClient.subscribe(CHANNEL_ITEM_UPDATED, async (message) => {
      try {
        const data = JSON.parse(message);
        const admins = await UserModel.findAll({ where: { admin: true } });
        if (!admins.length) return;
        const notif = {
          id: await pubClient.incr(ADMIN_NOTIFICATIONS_SEQ_KEY), // novo ID
          type: "ITEM_UPDATED",
          item_id: data.id,
          item_name: data.name,
          updater_user_id: data.user_id,
          changes: data.changes ?? null,
          timestamp: Date.now()
        };
        const key = ADMIN_NOTIFICATIONS_KEY;
        await pubClient.rPush(key, JSON.stringify(notif));
        await pubClient.lTrim(key, -100, -1);
        console.log("[Mensagem] Notificação de atualização enviada a admins:", notif);
      } catch (err) {
        console.error("Subscriber update handler error:", err);
      }
    });

    console.log("[Mensagem] Subscriber item.created + item.updated + item.deleted ativo");
  } catch (err) {
    console.error("initItemCreatedSubscriber error:", err);
  }
}

export const ADMIN_NOTIFICATIONS_KEY = "admin:notifications";
const ADMIN_NOTIFICATIONS_SEQ_KEY = "admin:notifications:seq"; // novo seq para IDs

export async function clearAdminNotifications(): Promise<void> {
  try {
    await pubClient.del(ADMIN_NOTIFICATIONS_KEY);
    console.log("[Mensagem] admin:notifications limpo");
  } catch (e) {
    console.error("clearAdminNotifications error:", e);
  }
}

export async function deleteAdminNotificationById(id: number): Promise<boolean> {
  try {
    const list = await pubClient.lRange(ADMIN_NOTIFICATIONS_KEY, 0, -1);
    for (const raw of list) {
      try {
        const obj = JSON.parse(raw);
        if (obj?.id === id) {
          const removed = await pubClient.lRem(ADMIN_NOTIFICATIONS_KEY, 1, raw);
          return removed > 0;
        }
      } catch {}
    }
    return false;
  } catch (e) {
    console.error("deleteAdminNotificationById error:", e);
    return false;
  }
}