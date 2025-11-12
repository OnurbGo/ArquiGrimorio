import { Request, Response } from "express";
import UserModel from "../models/UserModel";
import { generateToken } from "../utils/jwt";

export const LoginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email or Password are required" });
  }

  const user = await UserModel.findOne({ 
    where: { email },
    attributes: { include: ["password"] }
  });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const isValidPassword = await user.validatePassword(password);
  if (!isValidPassword) {
    return res.status(400).json({ error: "Email or Password are invalid" });
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    admin: (user as any).admin === true,
  } as UserModel);

  res.cookie("authToken", token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ message: "Login successful", token });
};
