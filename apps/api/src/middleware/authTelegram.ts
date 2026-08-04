import type { Request, Response, NextFunction } from "express";
import { nanoid } from "nanoid";
import { db } from "../db/index.js";
import { validateInitData } from "../lib/validateInitData.js";

export type AuthUser = {
  id: string;
  telegram_id: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function upsertUser(telegramId: number): AuthUser {
  const existing = db
    .prepare("SELECT id, telegram_id FROM users WHERE telegram_id = ?")
    .get(telegramId) as AuthUser | undefined;

  if (existing) return existing;

  const id = nanoid();
  db.prepare(
    "INSERT INTO users (id, telegram_id) VALUES (?, ?)"
  ).run(id, telegramId);
  return { id, telegram_id: telegramId };
}

export function authTelegram(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization") || "";
  const initData = header.startsWith("tma ")
    ? header.slice(4)
    : req.header("X-Telegram-Init-Data") || "";

  if (process.env.DEV_BYPASS_AUTH === "1" && !initData) {
    req.user = upsertUser(1);
    return next();
  }

  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    if (process.env.DEV_BYPASS_AUTH === "1") {
      req.user = upsertUser(1);
      return next();
    }
    return res.status(500).json({ error: "BOT_TOKEN not configured" });
  }

  if (!initData) {
    return res.status(401).json({ error: "Missing Telegram initData" });
  }

  const result = validateInitData(initData, botToken);
  if (!result.ok) {
    return res.status(401).json({ error: `Invalid initData: ${result.reason}` });
  }

  req.user = upsertUser(result.user.id);
  next();
}
