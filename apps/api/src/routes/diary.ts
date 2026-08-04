import { Router } from "express";
import { calcMealMacros, type ServingUnit, type MealType } from "@calorie/shared";
import { nanoid } from "nanoid";
import { db } from "../db/index.js";

type ProductRow = {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  serving_size: number;
  serving_unit: ServingUnit;
};

function todayDate(offsetMinutes = 180): string {
  const d = new Date(Date.now() + offsetMinutes * 60_000);
  return d.toISOString().slice(0, 10);
}

function getUserOffset(userId: string): number {
  const u = db
    .prepare("SELECT timezone_offset FROM users WHERE id = ?")
    .get(userId) as { timezone_offset: number };
  return u?.timezone_offset ?? 180;
}

export const diaryRouter = Router();

diaryRouter.get("/", (req, res) => {
  const offset = getUserOffset(req.user!.id);
  const date = String(req.query.date || todayDate(offset));

  const user = db
    .prepare("SELECT daily_calorie_target FROM users WHERE id = ?")
    .get(req.user!.id) as { daily_calorie_target: number };

  const entries = db
    .prepare(
      `SELECT e.*, p.name AS product_name
       FROM meal_entries e
       JOIN products p ON p.id = e.product_id
       WHERE e.user_id = ? AND e.entry_date = ?
       ORDER BY e.created_at ASC`
    )
    .all(req.user!.id, date);

  const totals = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
  };
  for (const e of entries as Array<Record<string, number>>) {
    totals.calories += e.calories_total;
    totals.protein += e.protein_total;
    totals.fat += e.fat_total;
    totals.carbs += e.carbs_total;
  }

  const target = user.daily_calorie_target;
  res.json({
    date,
    target,
    totals: {
      calories: Math.round(totals.calories * 10) / 10,
      protein: Math.round(totals.protein * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
    },
    remaining_calories: Math.round((target - totals.calories) * 10) / 10,
    entries,
  });
});

diaryRouter.post("/", (req, res) => {
  const {
    product_id,
    quantity,
    unit,
    meal_type = "snack",
    entry_date,
  } = req.body ?? {};

  if (!product_id || quantity == null || !unit) {
    return res.status(400).json({ error: "product_id, quantity, unit required" });
  }

  const product = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(product_id) as ProductRow | undefined;
  if (!product) return res.status(404).json({ error: "Product not found" });

  const macros = calcMealMacros(product, Number(quantity), unit as ServingUnit);
  const offset = getUserOffset(req.user!.id);
  const date = entry_date || todayDate(offset);
  const id = nanoid();

  db.prepare(
    `INSERT INTO meal_entries (
      id, user_id, product_id, quantity, unit,
      calories_total, protein_total, fat_total, carbs_total,
      meal_type, entry_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.user!.id,
    product_id,
    Number(quantity),
    unit,
    macros.calories_total,
    macros.protein_total,
    macros.fat_total,
    macros.carbs_total,
    meal_type as MealType,
    date
  );

  const entry = db
    .prepare(
      `SELECT e.*, p.name AS product_name
       FROM meal_entries e JOIN products p ON p.id = e.product_id
       WHERE e.id = ?`
    )
    .get(id);

  res.status(201).json(entry);
});

diaryRouter.delete("/:id", (req, res) => {
  const result = db
    .prepare("DELETE FROM meal_entries WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user!.id);
  if (result.changes === 0) return res.status(404).json({ error: "Not found" });
  res.status(204).end();
});

diaryRouter.post("/repeat-last", (req, res) => {
  const last = db
    .prepare(
      `SELECT * FROM meal_entries
       WHERE user_id = ?
       ORDER BY created_at DESC LIMIT 1`
    )
    .get(req.user!.id) as Record<string, unknown> | undefined;

  if (!last) return res.status(404).json({ error: "No previous meal" });

  const offset = getUserOffset(req.user!.id);
  const id = nanoid();
  db.prepare(
    `INSERT INTO meal_entries (
      id, user_id, product_id, quantity, unit,
      calories_total, protein_total, fat_total, carbs_total,
      meal_type, entry_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    req.user!.id,
    last.product_id,
    last.quantity,
    last.unit,
    last.calories_total,
    last.protein_total,
    last.fat_total,
    last.carbs_total,
    last.meal_type,
    todayDate(offset)
  );

  const entry = db
    .prepare(
      `SELECT e.*, p.name AS product_name
       FROM meal_entries e JOIN products p ON p.id = e.product_id
       WHERE e.id = ?`
    )
    .get(id);

  res.status(201).json(entry);
});
