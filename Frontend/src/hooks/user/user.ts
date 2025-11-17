import { User } from "@/interface/User";
import api from "@/services/api";

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  description?: string;
}

/*export const createUser = async (user: CreateUserPayload): Promise<User> => {
  const response = await api.post("/users", user);
  return response.data;
};*/

export const updateUser = async (id: number, user: User): Promise<User> => {
  const response = await api.put(`/users/${id}`, user);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export async function getUserCount(): Promise<number> {
  try {
    const res = await fetch(`${api.defaults.baseURL}/users/count`, {
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

export async function createUser(payload: CreateUserPayload) {
  const res = await fetch(`${api.defaults.baseURL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erro ao criar usuário");
  return res.json();
}