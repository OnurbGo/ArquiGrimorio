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
import { authMiddleware } from "../middleware/authMiddleware";
import multer from "multer"; // <— adicionado
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB
import { listAdminNotifications } from "../controllers/AdminNotificationController";

const router = express.Router();

router.post("/users", upload.single("file"), createUser); // <— aceita file

router.get("/users/count", getUserCount);
router.get("/users", authMiddleware, getAll);
router.get("/users/:id", authMiddleware, getUserById);
router.get("/users/:id/item", authMiddleware, getUserItems);
router.put("/users/:id", authMiddleware, upload.single("file"), updateUser); // <— aceita file
router.delete("/users/:id", authMiddleware, destroyUserById);
router.get("/admin/notifications", authMiddleware, listAdminNotifications);

export default router;
