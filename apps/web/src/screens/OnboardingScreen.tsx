import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, type GoalType } from "../api/client";

const GOALS: { id: GoalType; label: string; hint: string }[] = [
  { id: "lose", label: "Похудение", hint: "Дефицит калорий" },
  { id: "maintain", label: "Поддержание", hint: "Баланс" },
  { id: "gain", label: "Набор", hint: "Профицит" },
];

const PRESETS = [1500, 1800, 2000, 2500];

export function OnboardingScreen() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<GoalType>("maintain");
  const [target, setTarget] = useState(2000);
  const [saving, setSaving] = useState(false);

  async function finish() {
    setSaving(true);
    try {
      await api.updateMe({
        goal_type: goal,
        daily_calorie_target: target,
        complete_onboarding: true,
      });
      navigate("/search", { replace: true });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <p className="muted">Шаг {step} из 2</p>
      {step === 1 ? (
        <>
          <h1 className="hero-title">Какая у вас цель?</h1>
          <p className="muted">Это поможет предложить дневной лимит калорий.</p>
          <div className="card-list" style={{ marginTop: 20 }}>
            {GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                className="row"
                onClick={() => setGoal(g.id)}
                style={
                  goal === g.id
                    ? { borderColor: "var(--accent)", background: "var(--accent-soft)" }
                    : undefined
                }
              >
                <span>
                  <strong>{g.label}</strong>
                  <span className="muted">{g.hint}</span>
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="btn block"
            style={{ marginTop: 24 }}
            onClick={() => setStep(2)}
          >
            Далее
          </button>
        </>
      ) : (
        <>
          <h1 className="hero-title">Дневная цель</h1>
          <p className="muted">Сколько калорий в день?</p>
          <div className="chip-row">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                className={`chip ${target === p ? "active" : ""}`}
                onClick={() => setTarget(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <input
            className="search-input"
            type="number"
            min={800}
            max={6000}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value) || 0)}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn secondary" onClick={() => setStep(1)}>
              Назад
            </button>
            <button
              type="button"
              className="btn block"
              disabled={saving || target < 800}
              onClick={finish}
            >
              Начать
            </button>
          </div>
        </>
      )}
    </div>
  );
}
