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

const router = express.Router();

router.post("/users", createUser);

router.get("/users/count", getUserCount);
router.get("/users", authMiddleware, getAll);
router.get("/users/:id", authMiddleware, getUserById);
router.get("/users/:id/item", authMiddleware, getUserItems);
router.put("/users/:id", authMiddleware, updateUser);
router.delete("/users/:id", authMiddleware, destroyUserById);

export default router;
