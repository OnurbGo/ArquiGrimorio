import express from "express";

import cors from "cors";
import cookieParser from "cookie-parser";

import UserRoutes from "./routes/UserRouter";
import LoginRoutes from "./routes/LoginRouter";
import ItemRouter from "./routes/ItemRouter";
import ItemLikeRouter from "./routes/ItemLikeRouter";
import "./models/Association";
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import fs from 'fs';
import path from 'path';

const app = express();

app.use(cors());

app.use(cookieParser());
app.use(express.json());

app.use(UserRoutes);
app.use(LoginRoutes);
app.use(ItemRouter);
app.use(ItemLikeRouter);

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

function resolveOpenApiPath(): string | null {
  const candidates = [
    path.resolve(__dirname, "openapi-backend.yaml"),            
    path.resolve(__dirname, "../src/openapi-backend.yaml"),     
    path.resolve(process.cwd(), "src", "openapi-backend.yaml"), 
    path.resolve(process.cwd(), "openapi-backend.yaml"),        
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

let swaggerDocument: any;
try {
  const specPath = resolveOpenApiPath();
  if (!specPath) {
    console.warn("[swagger] openapi-backend.yaml não encontrado. Subindo UI vazia.");
    swaggerDocument = {
      openapi: "3.0.3",
      info: { title: "ArquiGrimorio API (spec ausente)", version: "1.0.0" },
      paths: {},
    };
  } else {
    console.log("[swagger] usando spec:", specPath);
    swaggerDocument = YAML.load(specPath);
  }
} catch (e: any) {
  console.error("[swagger] erro ao carregar spec:", e?.message || e);
  swaggerDocument = {
    openapi: "3.0.3",
    info: { title: "ArquiGrimorio API (erro ao carregar spec)", version: "1.0.0" },
    paths: {},
  };
}

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default app;
