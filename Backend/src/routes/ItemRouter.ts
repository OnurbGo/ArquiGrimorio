import express from "express";
import {authMiddleware, authMiddlewareUserOrAdmin } from "../middleware/authMiddleware";
import {listItems, getItemById, createItem, updateItem, deleteItem} from "../controllers/ItemController";
import { updateItemPhoto } from "../controllers/ItemController"; // add

const router = express.Router();

router.get("/item", listItems);
router.get("/item/:id", getItemById);

router.post("/item", authMiddleware, createItem);
router.put("/item/:id", authMiddleware, updateItem);
router.delete("/item/:id", authMiddleware, deleteItem);
router.put("/item/:id/photo", authMiddleware, updateItemPhoto);

export default router;
