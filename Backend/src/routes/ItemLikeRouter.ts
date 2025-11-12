import express from "express";
import {
  toggleLike,
  getLikesForItem,
  getLikesByUser,
  getLikesByItem,
} from "../controllers/ItemLikeController";
import { authMiddleware, requireSelfOrAdmin } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/itemlike/:id/toggle", requireSelfOrAdmin, toggleLike);
router.get("/itemlike/:id", requireSelfOrAdmin, getLikesForItem);

router.get("/itemlike/user/:userId", requireSelfOrAdmin, getLikesByUser);

router.get("/itemlike/item/:itemId", requireSelfOrAdmin, getLikesByItem);
export default router;
