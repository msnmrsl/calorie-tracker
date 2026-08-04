import { Router } from "express";
import { db } from "../db/index.js";

export const meRouter = Router();

meRouter.get("/", (req, res) => {
  const user = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(req.user!.id) as Record<string, unknown>;

  res.json({
    id: user.id,
    telegram_id: user.telegram_id,
    goal_type: user.goal_type,
    daily_calorie_target: user.daily_calorie_target,
    height: user.height,
    weight: user.weight,
    age: user.age,
    sex: user.sex,
    activity_level: user.activity_level,
    onboarded_at: user.onboarded_at,
  });
});

meRouter.patch("/", (req, res) => {
  const {
    goal_type,
    daily_calorie_target,
    height,
    weight,
    age,
    sex,
    activity_level,
    complete_onboarding,
  } = req.body ?? {};

  const current = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(req.user!.id) as Record<string, unknown>;

  const onboardedAt =
    complete_onboarding && !current.onboarded_at
      ? new Date().toISOString()
      : current.onboarded_at;

  db.prepare(
    `UPDATE users SET
      goal_type = COALESCE(?, goal_type),
      daily_calorie_target = COALESCE(?, daily_calorie_target),
      height = COALESCE(?, height),
      weight = COALESCE(?, weight),
      age = COALESCE(?, age),
      sex = COALESCE(?, sex),
      activity_level = COALESCE(?, activity_level),
      onboarded_at = ?
    WHERE id = ?`
  ).run(
    goal_type ?? null,
    daily_calorie_target ?? null,
    height ?? null,
    weight ?? null,
    age ?? null,
    sex ?? null,
    activity_level ?? null,
    onboardedAt,
    req.user!.id
  );

  const updated = db
    .prepare("SELECT * FROM users WHERE id = ?")
    .get(req.user!.id);
  res.json(updated);
});
