import { Router } from "express";
import { db } from "../db/index.js";

export const historyRouter = Router();

historyRouter.get("/", (req, res) => {
  const days = Math.min(Number(req.query.days) || 14, 60);

  const rows = db
    .prepare(
      `SELECT
         entry_date AS date,
         ROUND(SUM(calories_total), 1) AS calories,
         ROUND(SUM(protein_total), 1) AS protein,
         ROUND(SUM(fat_total), 1) AS fat,
         ROUND(SUM(carbs_total), 1) AS carbs,
         COUNT(*) AS entries_count
       FROM meal_entries
       WHERE user_id = ?
       GROUP BY entry_date
       ORDER BY entry_date DESC
       LIMIT ?`
    )
    .all(req.user!.id, days);

  const user = db
    .prepare("SELECT daily_calorie_target FROM users WHERE id = ?")
    .get(req.user!.id) as { daily_calorie_target: number };

  res.json({
    target: user.daily_calorie_target,
    days: rows,
  });
});
