import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../../.env") });
dotenv.config();

import { migrate } from "./db/index.js";
import { seedIfEmpty } from "./db/seed.js";
import { authTelegram } from "./middleware/authTelegram.js";
import { meRouter } from "./routes/me.js";
import { productsRouter } from "./routes/products.js";
import { diaryRouter } from "./routes/diary.js";
import { favoritesRouter } from "./routes/favorites.js";
import { historyRouter } from "./routes/history.js";
import { startBot } from "./bot/index.js";

migrate();
seedIfEmpty();

const app = express();

const corsOrigins = (process.env.CORS_ORIGINS || process.env.WEBAPP_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: corsOrigins.length > 0 ? corsOrigins : true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", authTelegram);
app.use("/api/me", meRouter);
app.use("/api/products", productsRouter);
app.use("/api/diary", diaryRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/history", historyRouter);

const port = Number(process.env.PORT || process.env.API_PORT || 3001);
app.listen(port, () => {
  console.log(`API http://localhost:${port}`);
  console.log(`DEV_BYPASS_AUTH=${process.env.DEV_BYPASS_AUTH || "0"}`);
});

startBot();
