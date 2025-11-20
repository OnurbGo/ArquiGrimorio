import { Request, Response } from "express";
import ItemModel from "../models/ItemModel";
import UserModel from "../models/UserModel";
import ItemLikeModel from "../models/ItemLikeModel";
import { Op } from "sequelize";
import { publishItemCreated, publishItemDeleted, publishItemUpdated } from "../utils/messageBus";
import { uploadItemImageViaProxy, ImageUploadError } from "../utils/imageProxy";
import { uploadStreamToImageService } from "../utils/imageProxy";
import Busboy from "busboy";

// Helper: cria via multipart (campos + file)
async function createItemFromMultipart(req: Request, res: Response) {
  return new Promise<Response>((resolve) => {
    const bb = Busboy({ headers: req.headers });
    const fields: Record<string, any> = {};
    let uploadPromise: Promise<any> | null = null;

    bb.on("field", (name: any, val: any) => {
      fields[name] = val;
    });

    bb.on("file", (name: any, file: any, info: any) => {
      if (name !== "file") return file.resume();
      const filename = info?.filename || `upload_${Date.now()}.jpg`;
      const mimeType = info?.mimeType || "image/jpeg";
      uploadPromise = uploadStreamToImageService(file, filename, mimeType, "item");
    });

    bb.on("close", async () => {
      try {
        const userId = (req as any).user?.id;
        if (!userId) return resolve(res.status(401).json({ error: "Unauthorized" }));

        const name = fields.name?.trim();
        const rarity = fields.rarity;
        const type = fields.type;
        const description = fields.description?.trim();
        const price = fields.price != null && fields.price !== "" ? Number(fields.price) : null;

        if (!name || !rarity || !type || !description) {
          return resolve(res.status(400).json({ error: "Missing required fields" }));
        }

        let finalImageUrl: string | null = fields.image_url ?? null;
        if (uploadPromise) {
          try {
            const up = await uploadPromise;
            finalImageUrl = up.urlNginx || up.url || null;
          } catch (e) {
            const ie = e as ImageUploadError;
            if (ie?.status) {
              return resolve(res.status(ie.status).json({ error: ie.message, code: ie.code, details: ie.details }));
            }
            return resolve(res.status(502).json({ error: "Failed to upload image" }));
          }
        }

        const item = await ItemModel.create({
          user_id: userId,
          name,
          rarity,
          type,
          description,
          price,
          image_url: finalImageUrl,
        });

        publishItemCreated({ id: item.id, name: item.name, user_id: item.user_id });
        return resolve(res.status(201).json(item));
      } catch (err) {
        console.error("createItemFromMultipart error:", err);
        return resolve(res.status(500).json({ error: "Internal server error" }));
      }
    });

    req.pipe(bb);
  });
}

// Helper: atualiza via multipart (campos + file)
async function updateItemFromMultipart(req: Request<{ id: string }>, res: Response) {
  return new Promise<Response>((resolve) => {
    const bb = Busboy({ headers: req.headers });
    const fields: Record<string, any> = {};
    let uploadPromise: Promise<any> | null = null;

    bb.on("field", (name: any, val: any) => {
      fields[name] = val;
    });

    bb.on("file", (name: any, file: any, info: any) => {
      if (name !== "file") return file.resume();
      const filename = info?.filename || `upload_${Date.now()}.jpg`;
      const mimeType = info?.mimeType || "image/jpeg";
      uploadPromise = uploadStreamToImageService(file, filename, mimeType, "item");
    });

    bb.on("close", async () => {
      try {
        const item = await ItemModel.findByPk(req.params.id);
        if (!item) return resolve(res.status(404).json({ error: "Item not found" }));

        const { name, rarity, type, description } = fields;
        const price = fields.price != null && fields.price !== "" ? Number(fields.price) : undefined;

        if (name !== undefined) item.name = name;
        if (rarity !== undefined) item.rarity = rarity;
        if (type !== undefined) item.type = type;
        if (description !== undefined) item.description = description;
        if (price !== undefined) item.price = isNaN(price as number) ? null : (price as number);

        if (fields.image_url !== undefined) item.image_url = fields.image_url || null;

        if (uploadPromise) {
          try {
            const up = await uploadPromise;
            const newUrl = up.urlNginx || up.url || null;
            if (!newUrl) return resolve(res.status(502).json({ error: "Image service did not return an URL" }));
            item.image_url = newUrl;
          } catch (e) {
            const ie = e as ImageUploadError;
            if (ie?.status) {
              return resolve(res.status(ie.status).json({ error: ie.message, code: ie.code, details: ie.details }));
            }
            return resolve(res.status(502).json({ error: "Failed to upload image" }));
          }
        }

        // Compute diffs antes de salvar
        const changedFields = item.changed() as string[] | false;
        let changes: Record<string, { from: unknown; to: unknown }> | undefined;
        if (changedFields && changedFields.length) {
          changes = {};
          for (const f of changedFields) {
            changes[f] = { from: (item as any).previous(f), to: (item as any).get(f) };
          }
        }

        await item.save();

        // Publica evento de atualização (inclui mudança de foto se houver)
        publishItemUpdated({
          id: item.id as unknown as number,
          name: (item as any).name,
          user_id: (req as any).user?.id,
          changes,
        });

        return resolve(res.status(200).json(item));
      } catch (err) {
        console.error("updateItemFromMultipart error:", err);
        return resolve(res.status(500).json({ error: "Internal server error" }));
      }
    });

    req.pipe(bb);
  });
}

export const createItem = async (req: Request, res: Response) => {
  try {
    const isMultipart = String(req.headers["content-type"] || "").includes("multipart/form-data");
    if (isMultipart) {
      return await createItemFromMultipart(req, res);
    }

    const { name, rarity, type, description, price, image_url } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!name || !rarity || !type || !description)
      return res.status(400).json({ error: "Missing required fields" });

    // Imagem: agora somente via URL já fornecida (sem arquivo)
    let finalImageUrl: string | null = image_url ?? null;

    const item = await ItemModel.create({
      user_id: userId,
      name,
      rarity,
      type,
      description,
      price: price ?? null,
      image_url: finalImageUrl,
    });

    publishItemCreated({ id: item.id, name: item.name, user_id: item.user_id });

    return res.status(201).json(item);
  } catch (error: any) {
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

// Exemplo: adapte dentro do handler que atualiza o item (PUT/PATCH /items/:id)
export const updateItem = async (req: Request<{ id: string }>, res: Response) => {
  try {
    // Não aceita multipart neste endpoint
    const contentType = String(req.headers["content-type"] || "");
    if (contentType.includes("multipart/form-data")) {
      return res.status(400).json({
        error: "Atualização de foto não é permitida em /item/:id. Use PUT /item/:id/photo.",
      });
    }

    // Bloqueia alteração de image_url por aqui
    if (Object.prototype.hasOwnProperty.call(req.body ?? {}, "image_url")) {
      return res.status(400).json({
        error: "image_url não pode ser alterado em /item/:id. Use PUT /item/:id/photo.",
      });
    }

    const id = Number(req.params.id);
    const user = (req as any).user;
    const userId = user?.id;
    const isAdmin = !!user?.admin;

    const item = await ItemModel.findByPk(id);
    if (!item) return res.status(404).json({ error: "Item não encontrado" });
    if (!isAdmin && item.user_id !== userId) {
      return res.status(403).json({ error: "Sem permissão para atualizar este item" });
    }

    // Campos permitidos (sem image_url)
    const allowed = ["name", "rarity", "type", "description", "price"];
    const payload: Record<string, any> = {};
    for (const k of allowed) {
      if (k in (req.body ?? {})) payload[k] = (req.body as any)[k];
    }

    // Aplique mudanças
    item.set(payload);

    // Capture diffs antes de salvar
    const changedFields = item.changed() as string[] | false;
    let changes: Record<string, { from: unknown; to: unknown }> | undefined;
    if (changedFields && changedFields.length) {
      changes = {};
      for (const f of changedFields) {
        changes[f] = { from: (item as any).previous(f), to: (item as any).get(f) };
      }
    }

    await item.save();

    // Publica evento
    publishItemUpdated({
      id: item.id as unknown as number,
      name: (item as any).name,
      user_id: userId,
      changes,
    });

    return res.json(item);
  } catch (err) {
    console.error("updateItem error:", err);
    return res.status(500).json({ error: "Erro interno ao atualizar item" });
  }
};

export const deleteItem = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = (req as any).user;
    const userId = user?.id;
    const isAdmin = !!user?.admin;

    const item = await ItemModel.findByPk(id);
    if (!item) return res.status(404).json({ error: "Item não encontrado" });
    if (!isAdmin && item.user_id !== userId) {
      return res.status(403).json({ error: "Sem permissão para excluir este item" });
    }

    const nameBeforeDelete = item.name;
    await item.destroy();

    // Dispara evento de exclusão
    publishItemDeleted({ id, name: nameBeforeDelete, user_id: userId });

    return res.json({ success: true });
  } catch (err) {
    console.error("deleteItem error:", err);
    return res.status(500).json({ error: "Erro interno ao excluir item" });
  }
};

// Novo: atualiza a imagem de um item existente via multipart (campo "file")
export const updateItemPhoto = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const item = await ItemModel.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const up = await uploadItemImageViaProxy(req);
    const newUrl = (up as any).urlNginx || (up as any).url || null;
    if (!newUrl) {
      return res.status(502).json({ error: "Image service did not return an URL" });
    }

    const prevUrl = item.image_url; // capturar anterior
    item.image_url = newUrl;
    await item.save();

    // Publica item.updated se a URL mudou
    if (prevUrl !== newUrl) {
      publishItemUpdated({
        id: item.id as unknown as number,
        name: (item as any).name,
        user_id: (req as any).user?.id,
        changes: { image_url: { from: prevUrl, to: newUrl } },
      });
    }

    return res.status(200).json(item.toJSON());
  } catch (e) {
    if (e instanceof ImageUploadError) {
      return res.status(e.status).json({ error: e.message, code: e.code, details: e.details });
    }
    console.error("updateItemPhoto error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
};
