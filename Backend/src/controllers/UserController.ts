import { Request, Response } from "express";
import UserModel from "../models/UserModel";
import ItemModel from "../models/ItemModel";
import { redisGet, redisSet, redisDel } from "../utils/redis"; // <- novo import
import { uploadUserPhotoViaProxy, ImageUploadError } from "../utils/imageProxy";

const toBool = (v: any) =>
  typeof v === 'boolean'
    ? v
    : typeof v === 'string'
    ? ['true', '1', 'yes', 'on'].includes(v.toLowerCase())
    : Boolean(v);

export const getUserCount = async (req: Request, res: Response) => {
  const CACHE_KEY = "userCount:v1";
  try {
    const cached = await redisGet(CACHE_KEY);
    if (cached !== null) {
      return res.status(200).json({ count: Number(cached), cached: true });
    }
    const count = await UserModel.count();
    // TTL 60 segundos (ajuste conforme necessidade)
    await redisSet(CACHE_KEY, String(count), 60);
    return res.status(200).json({ count, cached: false });
  } catch (error) {
    console.error("getUserCount error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserItems = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const userId = req.params.id;
    const user = await UserModel.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const items = await ItemModel.findAll({ where: { user_id: userId } });
    return res.status(200).json(items);
  } catch (error) {
    console.error("getUserItems error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const passwordRegex =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getAll = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.findAll(); // defaultScope já exclui password
    return res.status(200).json(users);
  } catch (error) {
    console.error("getAll error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json(user);
  } catch (error) {
    console.error("getUserById error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    // Cadastro não aceita imagem; use /users/:id/photo depois.
    const contentType = String(req.headers["content-type"] || "");
    if (contentType.includes("multipart/form-data")) {
      return res.status(400).json({
        error: "Envio de imagem não permitido no cadastro. Use PUT /users/:id/photo após criar a conta.",
      });
    }

    const { name, email, password, description, admin } = req.body;

    if (!email || !emailRegex.test(email))
      return res.status(400).json({ error: "Invalid email format" });

    if (!password || !passwordRegex.test(password))
      return res.status(400).json({
        error:
          "The password must have at least 8 characters, one uppercase letter, one number, and one special character.",
      });

    const existing = await UserModel.findOne({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email already in use" });

    // url_img sempre nulo no cadastro
    const finalUrlImg: string | null = null;

    const user = await UserModel.create({
      name: name || null,
      email,
      password,
      url_img: finalUrlImg,
      description: description || null,
      admin: admin !== undefined ? toBool(admin) : false,
    });
    await redisDel("userCount:v1");
    return res.status(201).json(user.toJSON());
  } catch (error) {
    console.error("createUser error:", error);
    if (error instanceof ImageUploadError) {
      return res.status(error.status).json({ error: error.code, message: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUser = async (req: Request<{ id: string }>, res: Response) => {
  try {
    // Bloqueia multipart (upload só na rota /users/:id/photo)
    const contentType = String(req.headers["content-type"] || "");
    if (contentType.includes("multipart/form-data")) {
      return res.status(400).json({
        error: "Upload de imagem não permitido aqui. Use PUT /users/:id/photo.",
      });
    }

    // Bloqueia alteração de url_img neste endpoint
    if (Object.prototype.hasOwnProperty.call(req.body ?? {}, "url_img")) {
      return res.status(400).json({
        error: "url_img não pode ser alterado em /users/:id. Use PUT /users/:id/photo.",
      });
    }

    const user = await UserModel.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, password, description, admin } = req.body;

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ error: "Name is required" });
      }
      user.name = name;
    }

    if (password !== undefined && String(password).trim()) {
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error:
            "The password must have at least 8 characters, one uppercase letter, one number, and one special character.",
        });
      }
      user.password = password;
    }

    if (description !== undefined) {
      user.description = description || null;
    }

    if (admin !== undefined) {
      (user as any).admin = toBool(admin);
    }

    await user.save();
    return res.status(200).json(user.toJSON());
  } catch (error) {
    console.error("updateUser error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const destroyUserById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const user = await UserModel.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    await user.destroy();
    // Invalida cache
    await redisDel("userCount:v1");
    return res.status(204).send();
  } catch (error) {
    console.error("destroyUserById error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateUserPhoto = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const user = await UserModel.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Encaminha o multipart/form-data para o microservice
    const up = await uploadUserPhotoViaProxy(req);

    const newUrl = (up as any).urlNginx || (up as any).url || null;
    if (!newUrl) {
      return res.status(502).json({ error: "Image service did not return an URL" });
    }

    user.url_img = newUrl;
    await user.save();

    return res.status(200).json(user.toJSON());
  } catch (e) {
    if (e instanceof ImageUploadError) {
      return res.status(e.status).json({ error: e.message, code: e.code, details: e.details });
    }
    console.error("updateUserPhoto error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
