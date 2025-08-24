import axios from "axios";
import { Item } from "../interface/Item";
import { User } from "../interface/User";

const api = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// ----------------- ITEMS -----------------

// Buscar todos os itens
export const getItems = async (params?: any): Promise<Item[]> => {
  const response = await api.get("/item", { params });
  const data = response.data;
  // normaliza: se vier { items: [...] }, devolve o array; se já vier [...], mantém
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

// Buscar item por ID
export const getItemById = async (id: number): Promise<Item> => {
  const response = await api.get(`/items/${id}`);
  return response.data;
};

// Criar item
export const createItem = async (item: Item): Promise<Item> => {
  const response = await api.post("/items", item);
  return response.data;
};

// Atualizar item
export const updateItem = async (id: number, item: Item): Promise<Item> => {
  const response = await api.put(`/items/${id}`, item);
  return response.data;
};

// Deletar item
export const deleteItem = async (id: number): Promise<void> => {
  await api.delete(`/items/${id}`);
};

// ----------------- USERS -----------------

// Buscar todos os usuários
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

// Buscar usuário por ID
export const getUserById = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// Criar usuário
export const createUser = async (user: User): Promise<User> => {
  const response = await api.post("/users", user);
  return response.data;
};

// Atualizar usuário
export const updateUser = async (id: number, user: User): Promise<User> => {
  const response = await api.put(`/users/${id}`, user);
  return response.data;
};

// Deletar usuário
export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export default api;
