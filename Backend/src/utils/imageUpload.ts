import axios, { AxiosError } from 'axios';
import FormData from 'form-data';

const IMAGE_SVC = process.env.IMAGE_SERVICE_URL || 'http://service-image:3000';

export interface ImageServiceResponse {
  filename: string;
  mimetype: string;
  size: number;
  url?: string;
  urlNginx?: string;
}

export class ImageUploadError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/**
 * Faz upload da imagem ao microserviço e propaga erros de forma estruturada.
 * Erros esperados para teste:
 *  - status 400 (INVALID_IMAGE_TYPE)
 *  - status 400 (NO_FILE) se microserviço retornar ausência de arquivo
 */
export async function uploadToImageService(
  file: Express.Multer.File,
  target: 'user' | 'item'
): Promise<ImageServiceResponse> {
  if (!file) {
    throw new ImageUploadError(400, 'NO_FILE', 'File not provided.');
  }

  const form = new FormData();
  form.append('file', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype,
  });

  const path = target === 'user' ? '/image-user/upload' : '/image-item/upload';

  try {
    const { data } = await axios.post(`${IMAGE_SVC}${path}`, form, {
      headers: {
        ...form.getHeaders(),
        Accept: 'application/json',
      },
      // timeout opcional para não travar testes
      timeout: 15000,
      validateStatus: s => s >= 200 && s < 300,
    });

    return data as ImageServiceResponse;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      handleAxiosUploadError(err);
    }
    // Fallback não Axios
    throw new ImageUploadError(500, 'IMAGE_UPLOAD_FAILURE', 'Failed to send image.', {
      original: (err as Error).message,
    });
  }
}

function handleAxiosUploadError(err: AxiosError) {
  const status = err.response?.status ?? 500;
  const data = err.response?.data as any;

  // Formatos comuns do NestJS: { statusCode, message, error }
  let rawMessage: any =
    data?.message ??
    data?.error ??
    data?.statusMessage ??
    err.message ??
    'Unknown error';

  // Se message vier como array (Nest ValidationPipe)
  if (Array.isArray(rawMessage)) {
    rawMessage = rawMessage.join('; ');
  }

  const normalizedMessage = String(rawMessage);

  // Inferir código
  let code = 'IMAGE_UPLOAD_FAILURE';

  if (status === 400) {
    if (/invalid file type/i.test(normalizedMessage)) {
      code = 'INVALID_IMAGE_TYPE';
    } else if (/(file not provided|no file)/i.test(normalizedMessage)) {
      code = 'NO_FILE';
    } else {
      code = 'BAD_REQUEST';
    }
  } else if (status === 413 || /file too large/i.test(normalizedMessage)) {
    code = 'FILE_TOO_LARGE';
  } else if (status >= 500 || !err.response) {
    code = 'IMAGE_SERVICE_ERROR';
  }

  throw new ImageUploadError(status, code, normalizedMessage, {
    service: 'image',
    response: {
      status,
      data,
    },
  });
}