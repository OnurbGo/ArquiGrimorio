import api from "@/services/api";

export const toggleItemLike = async (
  id: number,
  token?: string | null
): Promise<import("../../interface/ItemLike").ItemLikeToggleResponse> => {
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

export async function getLikesForItem(id: number): Promise<number> {
  const response = await api.get(`/itemlike/${id}`);
  const data = response.data;
  if (typeof data.totalLikes === "number") return data.totalLikes;
  if (typeof data === "number") return data;
  return 0;
}