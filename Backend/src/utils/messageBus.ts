import { createClient } from "redis";
import UserModel from "../models/UserModel";

const CHANNEL_ITEM_CREATED = "item.created";

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

// Inicializa assinante: grava notificações em lista Redis
export async function initItemCreatedSubscriber() {
  try {
    await subClient.subscribe(CHANNEL_ITEM_CREATED, async (message) => {
      try {
        const data = JSON.parse(message);
        // Busca admins
        const admins = await UserModel.findAll({ where: { admin: true } });
        if (!admins.length) return;
        // Armazena notificação em lista (cada admin pode ler a mesma lista)
        const notif = {
          type: "ITEM_CREATED",
            item_id: data.id,
            item_name: data.name,
            creator_user_id: data.user_id,
            timestamp: Date.now()
        };
        const key = "admin:notifications";
        await pubClient.rPush(key, JSON.stringify(notif));
        await pubClient.lTrim(key, -100, -1); // mantém últimas 100
        console.log("[Mensagem] Notificação enviada a admins:", notif);
      } catch (err) {
        console.error("Subscriber handler error:", err);
      }
    });
    console.log("[Mensagem] Subscriber item.created ativo");
  } catch (err) {
    console.error("initItemCreatedSubscriber error:", err);
  }
}