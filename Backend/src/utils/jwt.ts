import dotenv from 'dotenv';
import jwt from "jsonwebtoken";
import UserModel from "../models/UserModel";
dotenv.config();


const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = "7d"

export const generateToken = (user: UserModel): string => {
  const payload = { id: (user as any).id, admin: (user as any).admin };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string) : any => {
  return jwt.verify(token, JWT_SECRET);
};