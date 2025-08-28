export interface Item {
  id: number;
  user_id: number;
  name: string;
  description: string;
  rarity: string;
  type: string;
  price: number;
  image_url: string;
  createdAt: string;
  updatedAt: string;
  creator: ItemCreator;
}

export interface ItemCreator {
  id: number;
  name: string;
  url_img: string;
}

export interface ItemFilters {
  q?: string;
  rarity?: string;
  type?: string;
  page?: number;
}

export interface ItemDetails extends Item {
  likes: number;
  properties: Record<string, string>;
}
