export interface User {
  id: number;
  name: string;
  email: string;
  url_img: string;
  description?: string;
  admin?: boolean; // <— ADD
  createdAt: string;
  updatedAt: string;
}
