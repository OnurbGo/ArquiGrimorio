import express from "express";
import {authMiddleware, authMiddlewareUserOrAdmin } from "../middleware/authMiddleware";
import {listItems, getItemById, createItem, updateItem, deleteItem} from "../controllers/ItemController";
import multer from "multer"; // <— adicionado
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

const router = express.Router();

router.get("/item", listItems);
router.get("/item/:id", getItemById);
router.post("/item", authMiddleware, upload.single("file"), createItem);   // <— aceita file
router.put("/item/:id", authMiddlewareUserOrAdmin({ id: "id" }), upload.single("file"), updateItem); // <— aceita file
router.delete("/item/:id", authMiddlewareUserOrAdmin({ id: "id" }), deleteItem);

export default router;
