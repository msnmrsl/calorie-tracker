import { Bot, InlineKeyboard } from "grammy";
import cron from "node-cron";
import { db } from "../db/index.js";

export function startBot() {
  const token = process.env.BOT_TOKEN;
  const webappUrl = process.env.WEBAPP_URL || "http://localhost:5173";

  if (!token) {
    console.log("BOT_TOKEN not set — bot disabled (web/API still work)");
    return null;
  }

  const bot = new Bot(token);

  bot.command("start", async (ctx) => {
    const keyboard = new InlineKeyboard().webApp(
      "Открыть трекер",
      webappUrl
    );
    await ctx.reply(
      "Трекер калорий — найди продукт и добавь в дневник за несколько секунд.",
      { reply_markup: keyboard }
    );
  });

  bot.command("diary", async (ctx) => {
    const keyboard = new InlineKeyboard().webApp("Дневник", `${webappUrl}/diary`);
    await ctx.reply("Открыть дневник за сегодня:", { reply_markup: keyboard });
  });

  // Daily reminder at :00 every hour — sends to users whose reminder_hour matches
  cron.schedule("0 * * * *", async () => {
    const hourUtc = new Date().getUTCHours();
    const users = db
      .prepare(
        `SELECT u.telegram_id, u.daily_calorie_target, u.timezone_offset, u.reminder_hour, u.id
         FROM users u
         WHERE u.onboarded_at IS NOT NULL`
      )
      .all() as Array<{
      id: string;
      telegram_id: number;
      daily_calorie_target: number;
      timezone_offset: number;
      reminder_hour: number;
    }>;

    for (const u of users) {
      const localHour =
        (hourUtc + Math.floor((u.timezone_offset || 0) / 60) + 24) % 24;
      if (localHour !== (u.reminder_hour ?? 20)) continue;

      const localDate = new Date(
        Date.now() + (u.timezone_offset || 0) * 60_000
      )
        .toISOString()
        .slice(0, 10);

      const eaten = db
        .prepare(
          `SELECT COALESCE(SUM(calories_total), 0) AS c
           FROM meal_entries WHERE user_id = ? AND entry_date = ?`
        )
        .get(u.id, localDate) as { c: number };

      const remaining = Math.round(u.daily_calorie_target - eaten.c);
      const keyboard = new InlineKeyboard().webApp("Открыть трекер", webappUrl);

      try {
        await bot.api.sendMessage(
          u.telegram_id,
          eaten.c === 0
            ? "Сегодня ещё ничего не записано. Добавь приём пищи?"
            : `Осталось около ${remaining} ккал на сегодня. Не забудь записать еду.`,
          { reply_markup: keyboard }
        );
      } catch (err) {
        console.warn("Reminder failed for", u.telegram_id, err);
      }
    }
  });

  bot.start({
    onStart: () => console.log("Telegram bot started"),
  });

  return bot;
}
