import { Request, Response } from "express";
import ItemModel from "../models/ItemModel";
import UserModel from "../models/UserModel";
import ItemLikeModel from "../models/ItemLikeModel";
import { Op } from "sequelize";
import { uploadToImageService } from "../utils/imageUpload"; // <— adicionado

export const createItem = async (req: Request, res: Response) => {
  try {
    const { name, rarity, type, description, price, image_url } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!name || !rarity || !type || !description)
      return res.status(400).json({ error: "Missing required fields" });

    // Upload opcional de arquivo
    let finalImageUrl: string | null = image_url ?? null;
    const file = (req as any).file as Express.Multer.File | undefined;
    if (file) {
      const up = await uploadToImageService(file, "item");
      finalImageUrl = up.urlNginx || up.url || null;
    }

    const item = await ItemModel.create({
      user_id: userId,
      name,
      rarity,
      type,
      description,
      price: price ?? null,
      image_url: finalImageUrl,
    });

    return res.status(201).json(item);
  } catch (error) {
    console.error("createItem error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const listItems = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "20",
      name,
      rarity,
      type,
      creator,
      q,
    } = req.query;

    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNum = Math.min(
      Math.max(parseInt(limit as string, 10) || 20, 1),
      100
    );
    const offset = (pageNum - 1) * limitNum;

    const where: any = {};
    if (name) where.name = { [Op.like]: `%${name}%` };
    if (rarity) where.rarity = rarity;
    if (type) where.type = type;
    if (creator) where.user_id = creator;

    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } },
      ];
    }

    const { rows, count } = await ItemModel.findAndCountAll({
      where,
      include: [
        {
          model: UserModel,
          as: "creator",
          attributes: ["id", "name", "url_img"],
        },
      ],
      offset,
      limit: limitNum,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ items: rows, total: count, page: pageNum });
  } catch (error) {
    console.error("listItems error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getItemById = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const item = await ItemModel.findByPk(req.params.id, {
      include: [
        {
          model: UserModel,
          as: "creator",
          attributes: ["id", "name", "url_img"],
        },
      ],
    });
    if (!item) return res.status(404).json({ error: "Item not found" });

    const likesCount = await ItemLikeModel.count({
      where: { item_id: item.id },
    });

    return res.status(200).json({ ...item.toJSON(), likes: likesCount });
  } catch (error) {
    console.error("getItemById error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateItem = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const item = await ItemModel.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const loggedUserId = (req as any).user?.id;
    if (!loggedUserId || Number(loggedUserId) !== Number(item.user_id)) {
      return res
        .status(403)
        .json({ error: "Forbidden: only owner can edit item" });
    }

    const { name, rarity, type, description, price, image_url } = req.body;

    if (name !== undefined) item.name = name;
    if (rarity !== undefined) item.rarity = rarity;
    if (type !== undefined) item.type = type;
    if (description !== undefined) item.description = description;
    if (price !== undefined) item.price = price ?? null;

    // Upload opcional: arquivo tem prioridade; senão usa image_url do body (se definido)
    let newImageUrl: string | null | undefined = image_url;
    const file = (req as any).file as Express.Multer.File | undefined;
    if (file) {
      const up = await uploadToImageService(file, "item");
      newImageUrl = up.urlNginx || up.url || null;
    }
    if (newImageUrl !== undefined) item.image_url = newImageUrl ?? null;

    await item.save();
    return res.status(200).json(item);
  } catch (error) {
    console.error("updateItem error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteItem = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const item = await ItemModel.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const loggedUserId = (req as any).user?.id;
    if (!loggedUserId || Number(loggedUserId) !== Number(item.user_id)) {
      return res
        .status(403)
        .json({ error: "Forbidden: only owner can delete item" });
    }

    await item.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("deleteItem error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
