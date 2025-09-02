import { Request, Response } from "express";
import UserModel from "../models/UserModel";
import ItemModel from "../models/ItemModel";

export const getUserCount = async (req: Request, res: Response) => {
  try {
    const count = await UserModel.count();
    return res.status(200).json({ count });
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
    const { name, email, password, url_img, description } = req.body;

    if (!email || !emailRegex.test(email))
      return res.status(400).json({ error: "Invalid email format" });

    if (!password || !passwordRegex.test(password))
      return res.status(400).json({
        error:
          "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, um número e um caractere especial",
      });

    // Verifica email duplicado
    const existing = await UserModel.findOne({ where: { email } });
    if (existing)
      return res.status(409).json({ error: "Email already in use" });

    const user = await UserModel.create({
      name: name || null,
      email,
      password,
      url_img: url_img || null,
      description: description || null,
    });

    // defaultScope remove password; ainda assim usar toJSON para garantir
    return res.status(201).json(user.toJSON());
  } catch (error) {
    console.error("createUser error:", error);
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

    const { name, password, url_img, description } = req.body;

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
            "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, um número e um caractere especial",
        });
      }
      user.password = password; // hook de hash fará o resto
    }

    if (url_img !== undefined) {
      user.url_img = url_img || null;
    }

    if (description !== undefined) {
      user.description = description || null;
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

    const loggedUserId = (req as any).user?.id;
    if (!loggedUserId || Number(loggedUserId) !== Number(user.id)) {
      return res
        .status(403)
        .json({ error: "Forbidden: only owner can delete account" });
    }

    await user.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("destroyUserById error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
