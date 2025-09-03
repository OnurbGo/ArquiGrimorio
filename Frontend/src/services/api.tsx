// Buscar todos os likes de um usuário
import axios from "axios";
import { Platform } from "react-native";
import type { Item } from "../interface/Item";
import type { User } from "../interface/User";
export const getLikesByUser = async (
  userId: number,
  token?: string | null
): Promise<any[]> => {
  const response = await api.get(
    `/itemlike/user/${userId}`,
    token
      ? {
          headers: {
            ...api.defaults.headers.common,
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined
  );
  return response.data;
};

// Buscar todos os likes de um item
export const getLikesByItem = async (
  itemId: number,
  token?: string | null
): Promise<any[]> => {
  const response = await api.get(
    `/itemlike/item/${itemId}`,
    token
      ? {
          headers: {
            ...api.defaults.headers.common,
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined
  );
  return response.data;
};
export async function getUserCount(): Promise<number> {
  try {
    const res = await fetch(`${getBaseUrl()}/users/count`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) throw new Error("Erro ao buscar contagem de usuários");
    const data = await res.json();
    if (typeof data.count === "number") return data.count;
    if (typeof data === "number") return data;
    return 0;
  } catch {
    return 0;
  }
}
export const toggleItemLike = async (
  id: number,
  token?: string | null
): Promise<import("../interface/ItemLike").ItemLikeToggleResponse> => {
  const response = await api.post(
    `/itemlike/${id}/toggle`,
    {},
    token
      ? {
          headers: {
            ...api.defaults.headers.common,
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined
  );
  return response.data;
};

function getBaseUrl() {
  if (typeof process !== "undefined" && process.env && process.env.API_URL) {
    return process.env.API_URL;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  return "http://localhost:3000";
}

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export function setAuthToken(token?: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // se o backend retornar { message: '...' } no body, priorize isso
    const serverMsg = err?.response?.data?.message;
    const status = err?.response?.status;
    const message = serverMsg || err.message || "Erro na requisição";
    // Anexa informações úteis e re-lança
    const e: any = new Error(message);
    e.status = status;
    e.original = err;
    return Promise.reject(e);
  }
);

// ----------------- ITEMS -----------------

// Buscar todos os itens (normaliza formatos)
export const getItems = async (params?: any): Promise<Item[]> => {
  const response = await api.get("/item", { params });
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

// Buscar item por ID
export const getItemById = async (id: number): Promise<Item> => {
  const response = await api.get(`/item/${id}`);
  return response.data;
};

// Criar item
export const createItem = async (item: Item): Promise<Item> => {
  const response = await api.post("/item", item);
  return response.data;
};

// Atualizar item
export const updateItem = async (id: number, item: Item): Promise<Item> => {
  const response = await api.put(`/item/${id}`, item);
  return response.data;
};

// Deletar item
export const deleteItem = async (id: number): Promise<void> => {
  await api.delete(`/item/${id}`);
};

// ----------------- USERS -----------------

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  url_img: string;
  description?: string;
}

export const createUser = async (user: CreateUserPayload): Promise<User> => {
  const response = await api.post("/users", user);
  return response.data;
};

export const updateUser = async (id: number, user: User): Promise<User> => {
  const response = await api.put(`/users/${id}`, user);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export async function getLikesForItem(id: number): Promise<number> {
  const response = await api.get(`/itemlike/${id}`);
  const data = response.data;
  if (typeof data.totalLikes === "number") return data.totalLikes;
  if (typeof data === "number") return data;
  return 0;
}
export default api;
