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
