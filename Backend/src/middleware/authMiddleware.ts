import { verifyToken } from "../utils/jwt";
import { NextFunction, Request, Response } from "express";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tokenFromHeader = req.header("Authorization")?.replace("Bearer ", "");
  const tokenFromCookie = req.cookies?.authToken;
  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token" });
  }

  const decoded: any = verifyToken(token);
  if (!decoded || !decoded.id) {
    return res.status(401).json({ error: "Access denied. Invalid token" });
  }

  // Atacha id e admin do token
  (req as any).user = { id: decoded.id, admin: !!decoded.admin };
  next();
};
