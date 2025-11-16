import express from "express";
import {authMiddleware, authMiddlewareUserOrAdmin } from "../middleware/authMiddleware";
import {listItems, getItemById, createItem, updateItem, deleteItem} from "../controllers/ItemController";
import { updateItemPhoto } from "../controllers/ItemController"; // add

const router = express.Router();

router.get("/item", listItems);
router.get("/item/:id", getItemById);

router.post("/item", authMiddleware, createItem);
router.put("/item/:id", authMiddlewareUserOrAdmin({ id: "id" }), updateItem);
router.delete("/item/:id", authMiddlewareUserOrAdmin({ id: "id" }), deleteItem);
router.put("/item/:id/photo", authMiddlewareUserOrAdmin({ id: "id" }), updateItemPhoto);

export default router;
