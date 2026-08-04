import { useEffect, useState } from "react";
import { api } from "../api/client";

type DayRow = {
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  entries_count: number;
};

export function HistoryScreen() {
  const [target, setTarget] = useState(2000);
  const [days, setDays] = useState<DayRow[]>([]);

  useEffect(() => {
    api.history().then((h) => {
      setTarget(h.target);
      setDays(h.days);
    });
  }, []);

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="brand">История</div>
          <div className="muted">Цель {target} ккал / день</div>
        </div>
      </div>

      {days.length === 0 ? (
        <div className="empty">История появится после первых записей</div>
      ) : (
        <div className="card-list">
          {days.map((d) => {
            const delta = Math.round(d.calories - target);
            return (
              <div key={d.date} className="row" style={{ cursor: "default" }}>
                <span>
                  <strong>{d.date}</strong>
                  <span className="muted">
                    {d.entries_count} записей · Б {d.protein} / Ж {d.fat} / У{" "}
                    {d.carbs}
                  </span>
                </span>
                <span style={{ textAlign: "right" }}>
                  <span className="kcal">{d.calories}</span>
                  <div className="muted" style={{ fontSize: "0.75rem" }}>
                    {delta > 0 ? `+${delta}` : delta}
                  </div>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
