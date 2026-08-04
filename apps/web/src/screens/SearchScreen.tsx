import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, type Product } from "../api/client";

export function SearchScreen() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [recent, setRecent] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.recentProducts().then(setRecent).catch(() => {});
    api.favorites().then(setFavorites).catch(() => {});
    api.diary().then((d) => setRemaining(d.remaining_calories)).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      setLoading(true);
      api
        .searchProducts(q)
        .then((rows) => {
          if (!cancelled) setResults(rows);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, q ? 180 : 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  function openProduct(id: string) {
    navigate(`/products/${id}`);
  }

  const showLists = !q.trim();

  return (
    <div>
      <div className="topbar">
        <div>
          <div className="brand">Calorie Tracker</div>
          {remaining != null && (
            <div className="muted">Осталось {remaining} ккал сегодня</div>
          )}
        </div>
        <Link to="/diary" className="btn ghost">
          Дневник
        </Link>
      </div>

      <input
        className="search-input"
        autoFocus
        placeholder="Поиск: курица, творог, банан…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {showLists && favorites.length > 0 && (
        <>
          <div className="section-title">Избранное</div>
          <div className="card-list">
            {favorites.map((p) => (
              <ProductRow key={p.id} product={p} onClick={() => openProduct(p.id)} />
            ))}
          </div>
        </>
      )}

      {showLists && recent.length > 0 && (
        <>
          <div className="section-title">Недавние</div>
          <div className="card-list">
            {recent.map((p) => (
              <ProductRow key={p.id} product={p} onClick={() => openProduct(p.id)} />
            ))}
          </div>
        </>
      )}

      <div className="section-title">
        {q.trim() ? (loading ? "Ищем…" : "Результаты") : "Продукты"}
      </div>
      <div className="card-list">
        {results.length === 0 ? (
          <div className="empty">Ничего не найдено</div>
        ) : (
          results.map((p) => (
            <ProductRow key={p.id} product={p} onClick={() => openProduct(p.id)} />
          ))
        )}
      </div>
    </div>
  );
}

function ProductRow({
  product,
  onClick,
}: {
  product: Product;
  onClick: () => void;
}) {
  return (
    <button type="button" className="row" onClick={onClick}>
      <span>
        <strong>{product.name}</strong>
        <span className="muted">{product.category}</span>
      </span>
      <span className="kcal">{product.calories_per_100g} /100г</span>
    </button>
  );
}
