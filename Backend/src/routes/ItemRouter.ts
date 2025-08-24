import express from "express";
import {authMiddleware} from "../middleware/authMiddleware";
import {listItems, getItemById, createItem, updateItem, deleteItem} from "../controllers/ItemController";

const router = express.Router();

router.get("/item", listItems);
router.get("/item/:id", getItemById);
router.post("/item", authMiddleware, createItem);
router.put("/item/:id", authMiddleware, updateItem);
router.delete("/item/:id", authMiddleware, deleteItem);

export default router;
