import { Request, Response } from "express";
import ItemModel from "../models/ItemModel";
import ItemLikeModel from "../models/ItemLikeModel";

export const toggleLike = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const itemId = Number(req.params.id);
    const userId = (req as any).user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const item = await ItemModel.findByPk(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const existing = await ItemLikeModel.findOne({
      where: { item_id: itemId, user_id: userId },
    });

    if (existing) {
      // remove like (toggle off)
      await existing.destroy();
      const total = await ItemLikeModel.count({ where: { item_id: itemId } });
      return res.status(200).json({ liked: false, totalLikes: total });
    } else {
      // cria like
      await ItemLikeModel.create({ item_id: itemId, user_id: userId });
      const total = await ItemLikeModel.count({ where: { item_id: itemId } });
      return res.status(201).json({ liked: true, totalLikes: total });
    }
  } catch (error) {
    console.error("toggleLike error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getLikesForItem = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const itemId = Number(req.params.id);
    const item = await ItemModel.findByPk(itemId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const total = await ItemLikeModel.count({ where: { item_id: itemId } });
    return res.status(200).json({ totalLikes: total });
  } catch (error) {
    console.error("getLikesForItem error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
