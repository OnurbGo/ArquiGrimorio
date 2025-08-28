import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";

import UserRoutes from "./routes/UserRouter";
import LoginRoutes from "./routes/LoginRouter";
import ItemRouter from "./routes/ItemRouter";
import ItemLikeRouter from "./routes/ItemLikeRouter";
import "./models/Association";

const app = express();

const FRONT_URL = process.env.FRONT_URL;

app.use(cors());

app.use(cookieParser());
app.use(express.json());

app.use(UserRoutes);
app.use(LoginRoutes);
app.use(ItemRouter);
app.use(ItemLikeRouter);

export default app;
