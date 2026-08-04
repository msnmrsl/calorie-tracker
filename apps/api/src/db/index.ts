import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dbPath =
  process.env.DATABASE_PATH ||
  path.join(__dirname, "../../../.data/calorie.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      telegram_id INTEGER UNIQUE NOT NULL,
      goal_type TEXT,
      daily_calorie_target INTEGER NOT NULL DEFAULT 2000,
      height REAL,
      weight REAL,
      age INTEGER,
      sex TEXT,
      activity_level TEXT,
      reminder_hour INTEGER DEFAULT 20,
      timezone_offset INTEGER DEFAULT 180,
      onboarded_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      calories_per_100g REAL NOT NULL,
      protein_per_100g REAL NOT NULL,
      fat_per_100g REAL NOT NULL,
      carbs_per_100g REAL NOT NULL,
      serving_size REAL NOT NULL,
      serving_unit TEXT NOT NULL,
      tags TEXT NOT NULL DEFAULT '[]',
      synonyms TEXT NOT NULL DEFAULT '[]',
      is_verified INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS meal_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id),
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      calories_total REAL NOT NULL,
      protein_total REAL NOT NULL,
      fat_total REAL NOT NULL,
      carbs_total REAL NOT NULL,
      meal_type TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS meal_entries_user_date_idx
      ON meal_entries(user_id, entry_date);

    CREATE TABLE IF NOT EXISTS favorites (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, product_id)
    );
  `);
}
