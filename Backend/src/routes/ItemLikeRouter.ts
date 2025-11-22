import express from "express";
import {
  toggleLike,
  getLikesForItem,
  getLikesByUser,
  getLikesByItem,
} from "../controllers/ItemLikeController";
import { authMiddleware, authMiddlewareUserOrAdmin,  } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/itemlike/:id/toggle", authMiddleware, toggleLike);
router.get("/itemlike/:id", authMiddleware, getLikesForItem);

router.get("/itemlike/user/:userId", authMiddleware, getLikesByUser);

router.get("/itemlike/item/:itemId", authMiddleware, getLikesByItem);
export default router;
