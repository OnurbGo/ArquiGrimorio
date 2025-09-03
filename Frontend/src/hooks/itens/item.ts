import { Item } from "@/interface/Item";
import api from "@/services/api";

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