import express from "express";
import {
  createUser,
  destroyUserById,
  getAll,
  getUserById,
  updateUser,
  getUserItems,
  getUserCount,
  updateUserPhoto,
} from "../controllers/UserController";
import {  requireAdmin, authMiddlewareUserOrAdmin, authMiddleware } from "../middleware/authMiddleware";
import { listAdminNotifications, deleteAllAdminNotifications, deleteAdminNotification } from "../controllers/AdminNotificationController";

const router = express.Router();

router.post("/users", createUser);

router.get("/users/count", getUserCount);
router.get("/users", requireAdmin, getAll);
router.get("/users/:id", authMiddleware, getUserById);
router.get("/users/:id/item", authMiddleware, getUserItems);

router.put("/users/:id", authMiddlewareUserOrAdmin({ id: "id" }), updateUser);
router.put("/users/:id/photo", authMiddlewareUserOrAdmin({ id: "id" }), updateUserPhoto);

router.delete("/users/:id", authMiddlewareUserOrAdmin({ id: "id" }), destroyUserById);
router.get("/admin/notifications", requireAdmin, listAdminNotifications);
router.delete("/admin/notifications", requireAdmin, deleteAllAdminNotifications);
router.delete("/admin/notifications/:id", requireAdmin, deleteAdminNotification);

export default router;
