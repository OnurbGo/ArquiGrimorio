import http from "http";
import https from "https";
import { IncomingMessage } from "http";
import axios, { AxiosError } from "axios";
import FormData from "form-data";

export interface ImageServiceResponse {
  url?: string;
  urlNginx?: string;
  [key: string]: any;
}

export class ImageUploadError extends Error {
  status: number;
  code: string;
  details?: any;
  constructor(status: number, code: string, message: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const IMAGE_SVC = process.env.IMAGE_SERVICE_URL || "http://localhost:3000";

function getHttpClient(target: URL) {
  return target.protocol === "https:" ? https : http;
}

// Encaminha o corpo multipart diretamente ao microservice
async function forwardMultipart(req: IncomingMessage, path: string): Promise<ImageServiceResponse> {
  const target = new URL(IMAGE_SVC);
  const client = getHttpClient(target);

  const headers: http.OutgoingHttpHeaders = { ...req.headers };
  // Garanta que o host seja o do microservice
  headers.host = target.host;

  const options: http.RequestOptions = {
    protocol: target.protocol,
    hostname: target.hostname,
    port: target.port || (target.protocol === "https:" ? 443 : 80),
    path,
    method: "POST",
    headers,
  };

  console.log(`[proxy] forwarding multipart to ${path} ct=${headers['content-type']}`);
  return new Promise<ImageServiceResponse>((resolve, reject) => {
    const proxied = client.request(options, (svcRes) => {
      const chunks: Buffer[] = [];
      svcRes.on("data", (d) => chunks.push(Buffer.from(d)));
      svcRes.on("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        console.log(`[proxy] completed request to ${path} status=${svcRes.statusCode} bodyLen=${body.length}`);
        if (svcRes.statusCode && svcRes.statusCode >= 200 && svcRes.statusCode < 300) {
          try {
            const data = JSON.parse(body);
            resolve(data as ImageServiceResponse);
          } catch (e) {
            reject(new ImageUploadError(502, "INVALID_IMAGE_SVC_RESPONSE", "Invalid JSON from image service.", { body }));
          }
        } else {
          reject(
            new ImageUploadError(
              svcRes.statusCode || 502,
              "IMAGE_SVC_ERROR",
              "Image service failed.",
              { status: svcRes.statusCode, body }
            )
          );
        }
      });
    });

    proxied.on("error", (err) => {
      console.log(`[proxy] error reaching image service path=${path} err=${String(err)}`);
      reject(new ImageUploadError(502, "IMAGE_SVC_UNREACHABLE", "Failed to reach image service.", { error: String(err) }));
    });

    req.pipe(proxied);
  });
}

export function uploadItemImageViaProxy(req: IncomingMessage) {
  console.log(`[proxy] start upload item image`);
  return forwardMultipart(req, "/image-item/upload");
}

// Upload de IMAGEM DE USER (já usado no user)
export function uploadUserPhotoViaProxy(req: IncomingMessage) {
  console.log(`[proxy] start upload user photo`);
  return forwardMultipart(req, "/image-user/upload");
}

export async function uploadStreamToImageService(
  stream: NodeJS.ReadableStream,
  filename: string,
  mimetype: string,
  target: "user" | "item"
) {
  if (!stream) {
    throw new ImageUploadError(400, "NO_FILE", "File not provided.");
  }
  const allowed = ["image/png", "image/jpeg"];
  if (!allowed.includes(mimetype)) {
    throw new ImageUploadError(400, "INVALID_IMAGE_TYPE", "Only PNG or JPEG allowed.");
  }

  const form = new FormData();
  form.append("file", stream, { filename, contentType: mimetype });

  const path = target === "user" ? "/image-user/upload" : "/image-item/upload";

  try {
    const { data } = await axios.post(`${IMAGE_SVC}${path}`, form, {
      headers: { ...form.getHeaders(), Accept: "application/json" },
      timeout: 15000,
      validateStatus: s => s >= 200 && s < 300,
    });
    return data as ImageServiceResponse;
  } catch (err) {
    const e = err as AxiosError;
    throw new ImageUploadError(
      e.response?.status || 502,
      "IMAGE_SVC_ERROR",
      "Image service failed.",
      { status: e.response?.status, data: e.response?.data, message: e.message }
    );
  }
}