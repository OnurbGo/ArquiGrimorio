import { Item } from "@/interface/Item";
import api from "@/services/api";
import * as ImagePicker from "expo-image-picker";

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

// Criar item com imagem
export async function pickItemImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.85,
  });
  if (result.canceled) return null;
  return result.assets?.[0]?.uri || null;
}

export const createItemWithImage = async (payload: {
  name: string;
  rarity: string;
  type: string;
  description: string;
  price?: number;
  imageUri?: string;
}): Promise<Item> => {
  const form = new FormData();
  form.append("name", payload.name);
  form.append("rarity", payload.rarity);
  form.append("type", payload.type);
  form.append("description", payload.description);
  if (payload.price != null) form.append("price", String(payload.price));
  if (payload.imageUri) {
    form.append("file", {
      // @ts-ignore React Native FormData
      uri: payload.imageUri,
      name: "item.jpg",
      type: "image/jpeg",
    } as any);
  }
  const res = await api.post("/item", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Atualizar item
export const updateItem = async (id: number, item: Item): Promise<Item> => {
  const response = await api.put(`/item/${id}`, item);
  return response.data;
};

/**
 * Atualiza somente a foto do item (endpoint correto: PUT /item/{id}/photo).
 * Usa campo multipart "file".
 */
export async function updateItemPhoto(
  id: number,
  file: { uri: string; name: string; type: string },
  token?: string
) {
  const form = new FormData();
  form.append("file", {
    // @ts-ignore RN file
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as any);

  const res = await api.put(`/item/${id}/photo`, form, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.data;
}

// (Opcional) Deprecado: NÃO usar para atualizar imagem (backend rejeita multipart em /item/:id)
// export const updateItemWithImage = ...
// Atualizar item com imagem
export const updateItemWithImage = async (
  id: number,
  payload: {
    name?: string;
    rarity?: string;
    type?: string;
    description?: string;
    price?: number;
    imageUri?: string;
  }
): Promise<Item> => {
  const form = new FormData();
  if (payload.name) form.append("name", payload.name);
  if (payload.rarity) form.append("rarity", payload.rarity);
  if (payload.type) form.append("type", payload.type);
  if (payload.description) form.append("description", payload.description);
  if (payload.price != null) form.append("price", String(payload.price));
  if (payload.imageUri) {
    form.append("file", {
      // @ts-ignore
      uri: payload.imageUri,
      name: `item-${id}.jpg`,
      type: "image/jpeg",
    } as any);
  }
  const res = await api.put(`/item/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Deletar item
export const deleteItem = async (id: number): Promise<void> => {
  await api.delete(`/item/${id}`);
};

// Criar item com arquivo
export async function createItemWithFile(
  payload: Partial<Item>,
  file?: { uri: string; name: string; type: string },
  token?: string
) {
  const formData = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v !== undefined && v !== null) formData.append(k, String(v));
  });
  if (file) {
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: file.type,
    } as any);
  }
  const { data } = await api.post("/item", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return data;
}