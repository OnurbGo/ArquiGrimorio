import axios from 'axios';
import FormData from 'form-data';

const IMAGE_SVC = process.env.IMAGE_SERVICE_URL || 'http://service-image:3000';

export async function uploadToImageService(
  file: Express.Multer.File,
  target: 'user' | 'item'
) {
  const form = new FormData();
  form.append('file', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  const path = target === 'user' ? '/image-user/upload' : '/image-item/upload';
  const { data } = await axios.post(`${IMAGE_SVC}${path}`, form, {
    headers: form.getHeaders(),
  });
  return data as { filename: string; mimetype: string; size: number; url?: string; urlNginx?: string };
}