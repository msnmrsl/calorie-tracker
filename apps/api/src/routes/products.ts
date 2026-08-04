import { Router } from "express";
import { db } from "../db/index.js";

type ProductRow = {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  serving_size: number;
  serving_unit: string;
  tags: string;
  synonyms: string;
  is_verified: number;
};

function mapProduct(row: ProductRow) {
  return {
    ...row,
    tags: JSON.parse(row.tags || "[]"),
    synonyms: JSON.parse(row.synonyms || "[]"),
    is_verified: Boolean(row.is_verified),
  };
}

export const productsRouter = Router();

productsRouter.get("/", (req, res) => {
  const q = String(req.query.q || "").trim().toLowerCase();
  const limit = Math.min(Number(req.query.limit) || 30, 50);

  let rows: ProductRow[];
  if (!q) {
    rows = db
      .prepare("SELECT * FROM products ORDER BY name LIMIT ?")
      .all(limit) as ProductRow[];
  } else {
    const like = `%${q}%`;
    rows = db
      .prepare(
        `SELECT * FROM products
         WHERE lower(name) LIKE ?
            OR lower(category) LIKE ?
            OR lower(tags) LIKE ?
            OR lower(synonyms) LIKE ?
         ORDER BY
           CASE WHEN lower(name) LIKE ? THEN 0 ELSE 1 END,
           name
         LIMIT ?`
      )
      .all(like, like, like, like, `${q}%`, limit) as ProductRow[];
  }

  res.json(rows.map(mapProduct));
});

productsRouter.get("/recent", (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.* FROM products p
       INNER JOIN (
         SELECT product_id, MAX(created_at) AS last_at
         FROM meal_entries
         WHERE user_id = ?
         GROUP BY product_id
         ORDER BY last_at DESC
         LIMIT 12
       ) r ON r.product_id = p.id`
    )
    .all(req.user!.id) as ProductRow[];
  res.json(rows.map(mapProduct));
});

productsRouter.get("/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM products WHERE id = ?")
    .get(req.params.id) as ProductRow | undefined;
  if (!row) return res.status(404).json({ error: "Product not found" });
  res.json(mapProduct(row));
});
