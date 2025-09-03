import { Request, Response } from "express";
import ItemModel from "../models/ItemModel";
import ItemLikeModel from "../models/ItemLikeModel";

export const toggleLike = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const itemId = Number(req.params.id);

    // O middleware de autenticação deve popular req.user
    const user = (req as any).user;
    if (!user || !user.id) {
      console.warn("toggleLike: Usuário não autenticado ou token inválido.");
      return res
        .status(401)
        .json({ error: "Usuário não autenticado. Envie um token JWT válido." });
    }
    const userId = user.id;

    const item = await ItemModel.findByPk(itemId);
    if (!item) {
      console.warn(`toggleLike: Item com id ${itemId} não encontrado.`);
      return res.status(404).json({ error: "Item não encontrado." });
    }

    // Verifica se já existe like
    const existing = await ItemLikeModel.findOne({
      where: { item_id: itemId, user_id: userId },
    });

    if (existing) {
      // Remove o like
      await existing.destroy();
      const total = await ItemLikeModel.count({ where: { item_id: itemId } });
      return res.status(200).json({ liked: false, totalLikes: total });
    } else {
      // Adiciona o like
      await ItemLikeModel.create({ item_id: itemId, user_id: userId });
      const total = await ItemLikeModel.count({ where: { item_id: itemId } });
      return res.status(201).json({ liked: true, totalLikes: total });
    }
  } catch (error: any) {
    console.error("toggleLike error:", error);
    // Mensagem de erro detalhada
    return res.status(500).json({
      error: "Erro interno ao processar o like.",
      details: error.message,
    });
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

// Handler para buscar todos os likes de um usuário
export const getLikesByUser = async (
  req: Request<{ userId: string }>,
  res: Response
) => {
  const { userId } = req.params;
  try {
    const userIdNum = Number(userId);
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: "userId inválido" });
    }
    const likes = await ItemLikeModel.findAll({
      where: { user_id: userIdNum },
    });
    res.json(likes);
  } catch (err) {
    console.error("getLikesByUser error:", err);
    res.status(500).json({
      error: "Erro ao buscar likes do usuário.",
      details: (err as Error).message,
    });
  }
};

// Handler para buscar todos os likes de um item
export const getLikesByItem = async (
  req: Request<{ itemId: string }>,
  res: Response
) => {
  const { itemId } = req.params;
  try {
    const itemIdNum = Number(itemId);
    if (isNaN(itemIdNum)) {
      return res.status(400).json({ error: "itemId inválido" });
    }
    const likes = await ItemLikeModel.findAll({
      where: { item_id: itemIdNum },
    });
    res.json(likes);
  } catch (err) {
    console.error("getLikesByItem error:", err);
    res.status(500).json({
      error: "Erro ao buscar likes do item.",
      details: (err as Error).message,
    });
  }
};
