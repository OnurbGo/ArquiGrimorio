import express from "express";
import { LoginUser } from "../controllers/LoginController";

const router = express.Router();

router.post("/login", LoginUser);
export default router;
