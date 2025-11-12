import express from "express";
import {
  createUser,
  destroyUserById,
  getAll,
  getUserById,
  updateUser,
  getUserItems,
  getUserCount,
} from "../controllers/UserController";
import { authMiddleware, requireAdmin, requireSelfOrAdmin } from "../middleware/authMiddleware";
import multer from "multer"; // <— adicionado
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB
import { listAdminNotifications } from "../controllers/AdminNotificationController";

const router = express.Router();

router.post("/users", upload.single("file"), createUser); // <— aceita file

router.get("/users/count", getUserCount);
router.get("/users", requireAdmin, getAll);
router.get("/users/:id", requireSelfOrAdmin, getUserById);
router.get("/users/:id/item", requireSelfOrAdmin, getUserItems);
router.put("/users/:id", requireSelfOrAdmin, upload.single("file"), updateUser); // <— aceita file
router.delete("/users/:id", requireSelfOrAdmin, destroyUserById);
router.get("/admin/notifications", requireAdmin, listAdminNotifications);

export default router;
