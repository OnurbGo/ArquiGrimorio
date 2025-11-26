export interface ItemCreator {
  id: number;
  name: string;
}

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

export interface User {
  id: number;
  name: string;
  email: string;
  url_img: string;
  description?: string;
  admin?: boolean;
  createdAt: string;
  updatedAt: string;
}
