import { verifyToken } from "../utils/jwt";
import { NextFunction, Request, Response } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        name: string;
        email: string;
        admin: boolean;
      };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token mal formatado" });
  }

  try {
    const decoded = verifyToken(token);
    const user = decoded.user ?? decoded;
    console.log("Decoded Token:", decoded);
    req.user = {
      id: Number(user.id),
      name: user.name,
      email: user.email,
      admin: !!user.admin,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};


export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return authMiddleware(req, res, () => {
    if (!req.user?.admin) {
      return res.status(403).json({ message: "Acesso negado. Permissão de administrador necessária" });
    }
    next();
  });
};

export const requireSelfOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return authMiddleware(req, res, () => {
    console.log("Request Params:", req.params, req.user);
    const paramId = Number(req.params.id) ?? null;
    const tokenUserId = Number(req.user?.id);
    console.log("Token User ID:", tokenUserId);

    if (!Number.isFinite(paramId)) {
      return res.status(400).json({ message: "Parâmetro id inválido" });
    }

    if (!(req.user?.admin)) {
      return res.status(403).json({
        message: "Acesso negado. Você só pode acessar o próprio recurso."
      });
    }

    next();
  });
};