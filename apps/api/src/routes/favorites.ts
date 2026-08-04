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

export const favoritesRouter = Router();

favoritesRouter.get("/", (req, res) => {
  const rows = db
    .prepare(
      `SELECT p.* FROM products p
       JOIN favorites f ON f.product_id = p.id
       WHERE f.user_id = ?
       ORDER BY p.name`
    )
    .all(req.user!.id) as ProductRow[];
  res.json(rows.map(mapProduct));
});

favoritesRouter.post("/", (req, res) => {
  const { product_id } = req.body ?? {};
  if (!product_id) return res.status(400).json({ error: "product_id required" });

  const product = db
    .prepare("SELECT id FROM products WHERE id = ?")
    .get(product_id);
  if (!product) return res.status(404).json({ error: "Product not found" });

  db.prepare(
    "INSERT OR IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)"
  ).run(req.user!.id, product_id);

  res.status(201).json({ ok: true });
});

favoritesRouter.delete("/:productId", (req, res) => {
  db.prepare(
    "DELETE FROM favorites WHERE user_id = ? AND product_id = ?"
  ).run(req.user!.id, req.params.productId);
  res.status(204).end();
});
