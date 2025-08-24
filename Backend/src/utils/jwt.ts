import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "Secret_key";
const JWT_EXPIRES_IN = "7d";

export type JwtPayload = {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
};

export const generateToken = (user: { id: number; email: string }): string => {
  // Gera um payload mínimo
  const payload = { id: user.id, email: user.email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
