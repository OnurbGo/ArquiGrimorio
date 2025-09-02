import express from "express";
import {
  toggleLike,
  getLikesForItem,
  getTotalLikes,
} from "../controllers/ItemLikeController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/itemlike/:id/toggle", authMiddleware, toggleLike);
router.get("/itemlike/:id", authMiddleware, getLikesForItem);

router.get("/itemlike/total", getTotalLikes);

export default router;
