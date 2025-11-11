import { Request, Response } from "express";
import UserModel from "../models/UserModel";
import ItemModel from "../models/ItemModel";
import { uploadToImageService, ImageUploadError } from "../utils/imageUpload";
import { redisGet, redisSet, redisDel } from "../utils/redis"; // <- novo import

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
    const { name, email, password, url_img, description, admin } = req.body;

    if (!email || !emailRegex.test(email))
      return res.status(400).json({ error: "Invalid email format" });

    if (!password || !passwordRegex.test(password))
      return res.status(400).json({
        error:
          "The password must have at least 8 characters, one uppercase letter, one number, and one special character.",
      });

    // Verifica email duplicado
    const existing = await UserModel.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ error: "Email already in use" });

    // Upload opcional
    let finalUrlImg: string | null = url_img || null;
    const file = (req as any).file as Express.Multer.File | undefined;
    if (file) {
      const up = await uploadToImageService(file, "user");
      finalUrlImg = up.urlNginx || up.url || null;
    }

    const user = await UserModel.create({
      name: name || null,
      email,
      password,
      url_img: finalUrlImg,
      description: description || null,
      admin: admin !== undefined ? toBool(admin) : false,
    });
    // Invalida cache
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

export const updateUser = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const user = await UserModel.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const loggedUserId = (req as any).user?.id;
    if (!loggedUserId || Number(loggedUserId) !== Number(user.id)) {
      return res
        .status(403)
        .json({ error: "Forbidden: only owner can update profile" });
    }

    const { name, password, url_img, description, admin } = req.body;

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
      user.password = password; // hook de hash fará o resto
    }

    // Imagem
    let newUrlImg: string | null | undefined = url_img;
    const file = (req as any).file as Express.Multer.File | undefined;
    if (file) {
      const up = await uploadToImageService(file, "user");
      newUrlImg = up.urlNginx || up.url || null;
    }
    if (newUrlImg !== undefined) {
      user.url_img = newUrlImg || null;
    }

    if (description !== undefined) {
      user.description = description || null;
    }

    // Permite trocar admin diretamente
    if (admin !== undefined) {
      (user as any).admin = toBool(admin);
    }

    await user.save();
    return res.status(200).json(user.toJSON());
  } catch (error) {
    console.error("updateUser error:", error);
    if (error instanceof ImageUploadError) {
      return res.status(error.status).json({ error: error.code, message: error.message });
    }
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

    const loggedUserId = (req as any).user?.id;
    if (!loggedUserId || Number(loggedUserId) !== Number(user.id)) {
      return res
        .status(403)
        .json({ error: "Forbidden: only owner can delete account" });
    }

    await user.destroy();
    // Invalida cache
    await redisDel("userCount:v1");
    return res.status(204).send();
  } catch (error) {
    console.error("destroyUserById error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
