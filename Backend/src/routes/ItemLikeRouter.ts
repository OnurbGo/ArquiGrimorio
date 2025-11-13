import express from "express";
import {
  toggleLike,
  getLikesForItem,
  getLikesByUser,
  getLikesByItem,
} from "../controllers/ItemLikeController";
import { authMiddleware, authMiddlewareUserOrAdmin,  } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/itemlike/:id/toggle", authMiddlewareUserOrAdmin({ id: "id" }), toggleLike);
router.get("/itemlike/:id", authMiddlewareUserOrAdmin({ id: "id" }), getLikesForItem);

router.get("/itemlike/user/:userId", authMiddlewareUserOrAdmin({ id: "userId" }), getLikesByUser);

router.get("/itemlike/item/:itemId", authMiddlewareUserOrAdmin({ id: "itemId" }), getLikesByItem);
export default router;
