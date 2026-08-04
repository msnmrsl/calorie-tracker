import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, type MealEntry } from "../api/client";

type DiaryData = {
  date: string;
  target: number;
  totals: { calories: number; protein: number; fat: number; carbs: number };
  remaining_calories: number;
  entries: MealEntry[];
};

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Завтрак",
  lunch: "Обед",
  dinner: "Ужин",
  snack: "Перекус",
};

export function DiaryScreen() {
  const [data, setData] = useState<DiaryData | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.diary().then(setData);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: string) {
    await api.deleteMeal(id);
    load();
  }

  async function repeatLast() {
    setBusy(true);
    try {
      await api.repeatLast();
      load();
    } catch {
      // no previous meal
    } finally {
      setBusy(false);
    }
  }

  if (!data) return <div className="loading">Загрузка дневника…</div>;

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="brand">Дневник</div>
          <div className="muted">{data.date}</div>
        </div>
        <Link to="/search" className="btn ghost">
          + Еда
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat">
          <div className="label">Съедено</div>
          <div className="value">{data.totals.calories}</div>
        </div>
        <div className="stat">
          <div className="label">Осталось</div>
          <div
            className="value"
            style={{
              color: data.remaining_calories < 0 ? "var(--danger)" : "var(--accent)",
            }}
          >
            {data.remaining_calories}
          </div>
        </div>
      </div>

      <div className="macros">
        <div>
          <strong>{data.totals.protein}</strong>
          <span>белки</span>
        </div>
        <div>
          <strong>{data.totals.fat}</strong>
          <span>жиры</span>
        </div>
        <div>
          <strong>{data.totals.carbs}</strong>
          <span>углеводы</span>
        </div>
        <div>
          <strong>{data.target}</strong>
          <span>цель</span>
        </div>
      </div>

      <button
        type="button"
        className="btn secondary block"
        disabled={busy}
        onClick={repeatLast}
        style={{ marginBottom: 16 }}
      >
        Повторить последний приём
      </button>

      <div className="section-title">Приёмы пищи</div>
      {data.entries.length === 0 ? (
        <div className="empty">
          Пока пусто.{" "}
          <Link to="/search" style={{ color: "var(--accent)" }}>
            Добавить продукт
          </Link>
        </div>
      ) : (
        <div className="card-list">
          {data.entries.map((e) => (
            <div key={e.id} className="row" style={{ cursor: "default" }}>
              <span>
                <strong>{e.product_name}</strong>
                <span className="muted">
                  {MEAL_LABELS[e.meal_type] || e.meal_type} · {e.quantity} {e.unit}
                </span>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="kcal">{e.calories_total}</span>
                <button
                  type="button"
                  className="btn secondary"
                  style={{ padding: "6px 10px" }}
                  onClick={() => remove(e.id)}
                >
                  ✕
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
