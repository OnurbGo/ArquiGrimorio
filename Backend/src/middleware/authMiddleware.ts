import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

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

/*
  * Middleware de autenticação para proteger rotas.
  * Requer token JWT válido no cabeçalho Authorization.
*/
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const authHeader = req.headers.authorization?.trim();
  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token mal formatado" });
  }

  try {
    const decoded = verifyToken(token);
    console.log(decoded);

    if (!decoded.id) {
      return res.status(403).json({ message: "Acesso negado. Usuário não autenticado." });
    }

    req.user = {
      id: decoded.id,
      name: decoded.name ?? "",
      email: decoded.email ?? "",
      admin: !!decoded.admin,
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

/**
 * Middleware para permitir acesso do usuario comum quanto do admin a dados pessoais de um usuario
 * requer o id do usuario no parametro da rota
*/
export const authMiddlewareUserOrAdmin = ({id}: {id: string}) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return authMiddleware(req, res, () => {

    const isAdmin = Boolean(req.user?.admin);
    const isIdToken = Number(req.user?.id);
    const isIdParam = Number(req.params[id]);
    console.log('isIdToken:', isIdToken, 'isIdParam:', isIdParam);

    if (!isIdParam) {
      return res.status(401).json({ mensage: "Chave enviada é invalido" });
    }

    if (!isIdToken) {
      return res.status(401).json({ mensage: "Id do Usuario nao foi informado" });
    }


    if (!isAdmin && isIdToken !== isIdParam) {
      return res.status(403).json({
        message: "Acesso negado. Você só pode acessar o próprio recurso.",
      });
    }

    next();
  });
};