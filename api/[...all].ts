import express from "express";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { registerRoutes } from "../server/routes";

const app = express();
let ready = false;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!ready) {
    await registerRoutes(app);
    ready = true;
  }
  app(req as any, res as any);
}