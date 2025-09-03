export interface ItemLike {
  id: number;
  item_id: number;
  user_id: number;
  createdAt?: string;
}
export * from "./ItemLike";
export interface ItemLike {
  id: number;
  item_id: number;
  user_id: number;
  createdAt?: string;
}

export interface ItemLikeToggleResponse {
  liked: boolean;
  totalLikes: number;
}

export interface ItemLikeCountResponse {
  totalLikes: number;
}
