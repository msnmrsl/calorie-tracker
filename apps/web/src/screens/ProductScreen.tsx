import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  calcMealMacros,
  type MealType,
  type ServingUnit,
} from "@calorie/shared";
import { api, type Product } from "../api/client";
import { getTelegram } from "../lib/telegram";

const MEALS: { id: MealType; label: string }[] = [
  { id: "breakfast", label: "Завтрак" },
  { id: "lunch", label: "Обед" },
  { id: "dinner", label: "Ужин" },
  { id: "snack", label: "Перекус" },
];

export function ProductScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(100);
  const [unit, setUnit] = useState<ServingUnit>("g");
  const [mealType, setMealType] = useState<MealType>("snack");
  const [fav, setFav] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.getProduct(id).then((p) => {
      setProduct(p);
      setUnit(p.serving_unit);
      setQuantity(p.serving_size);
    });
    api.favorites().then((list) => setFav(list.some((f) => f.id === id)));
  }, [id]);

  useEffect(() => {
    const tg = getTelegram();
    const back = () => navigate(-1);
    tg?.BackButton?.show();
    tg?.BackButton?.onClick(back);
    return () => {
      tg?.BackButton?.offClick(back);
      tg?.BackButton?.hide();
    };
  }, [navigate]);

  const macros = useMemo(() => {
    if (!product) return null;
    return calcMealMacros(product, quantity, unit);
  }, [product, quantity, unit]);

  async function toggleFav() {
    if (!product) return;
    if (fav) {
      await api.removeFavorite(product.id);
      setFav(false);
    } else {
      await api.addFavorite(product.id);
      setFav(true);
    }
  }

  async function add() {
    if (!product) return;
    setSaving(true);
    setError(null);
    try {
      await api.addMeal({
        product_id: product.id,
        quantity,
        unit,
        meal_type: mealType,
      });
      getTelegram()?.HapticFeedback?.impactOccurred("medium");
      navigate("/diary");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  if (!product || !macros) {
    return <div className="loading">Загрузка продукта…</div>;
  }

  return (
    <div>
      <div className="topbar">
        <button type="button" className="btn secondary" onClick={() => navigate(-1)}>
          Назад
        </button>
        <button type="button" className="btn ghost" onClick={toggleFav}>
          {fav ? "★ В избранном" : "☆ В избранное"}
        </button>
      </div>

      <h1 className="hero-title">{product.name}</h1>
      <p className="muted">
        {product.category} · {product.calories_per_100g} ккал / 100{" "}
        {product.serving_unit === "ml" ? "мл" : "г"}
      </p>

      <div className="macros">
        <div>
          <strong>{macros.calories_total}</strong>
          <span>ккал</span>
        </div>
        <div>
          <strong>{macros.protein_total}</strong>
          <span>белки</span>
        </div>
        <div>
          <strong>{macros.fat_total}</strong>
          <span>жиры</span>
        </div>
        <div>
          <strong>{macros.carbs_total}</strong>
          <span>углеводы</span>
        </div>
      </div>

      <div className="section-title">Количество</div>
      <div className="qty-row">
        <input
          type="number"
          min={1}
          step={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value) || 0)}
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value as ServingUnit)}
        >
          <option value="g">г</option>
          <option value="ml">мл</option>
          <option value="pcs">шт</option>
        </select>
      </div>
      <p className="muted">
        Стандартная порция: {product.serving_size}{" "}
        {product.serving_unit === "pcs" ? "г / шт" : product.serving_unit}
      </p>

      <div className="section-title">Приём пищи</div>
      <div className="chip-row">
        {MEALS.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`chip ${mealType === m.id ? "active" : ""}`}
            onClick={() => setMealType(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {error && <p style={{ color: "var(--danger)" }}>{error}</p>}

      <button
        type="button"
        className="btn block"
        disabled={saving || quantity <= 0}
        onClick={add}
        style={{ marginTop: 12 }}
      >
        {saving ? "Добавляем…" : "Добавить в дневник"}
      </button>
    </div>
  );
}
