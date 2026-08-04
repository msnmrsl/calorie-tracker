import { nanoid } from "nanoid";
import { db, migrate } from "./index.js";

type SeedProduct = {
  name: string;
  category: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  serving_size: number;
  serving_unit: "g" | "ml" | "pcs";
  tags: string[];
  synonyms: string[];
};

const PRODUCTS: SeedProduct[] = [
  { name: "Куриная грудка", category: "Мясо", calories: 165, protein: 31, fat: 3.6, carbs: 0, serving_size: 100, serving_unit: "g", tags: ["белок", "диета"], synonyms: ["курица", "грудка"] },
  { name: "Яйцо куриное", category: "Яйца", calories: 155, protein: 13, fat: 11, carbs: 1.1, serving_size: 50, serving_unit: "pcs", tags: ["завтрак"], synonyms: ["яйца"] },
  { name: "Овсянка", category: "Крупы", calories: 389, protein: 17, fat: 7, carbs: 66, serving_size: 40, serving_unit: "g", tags: ["завтрак", "крупа"], synonyms: ["овсяные хлопья", "геркулес"] },
  { name: "Творог 5%", category: "Молочка", calories: 121, protein: 17, fat: 5, carbs: 1.8, serving_size: 100, serving_unit: "g", tags: ["белок", "молочка"], synonyms: ["творог"] },
  { name: "Гречка", category: "Крупы", calories: 343, protein: 13, fat: 3.4, carbs: 72, serving_size: 60, serving_unit: "g", tags: ["крупа"], synonyms: ["гречневая крупа"] },
  { name: "Рис белый", category: "Крупы", calories: 365, protein: 7, fat: 0.7, carbs: 80, serving_size: 60, serving_unit: "g", tags: ["крупа"], synonyms: ["рис"] },
  { name: "Банан", category: "Фрукты", calories: 89, protein: 1.1, fat: 0.3, carbs: 23, serving_size: 120, serving_unit: "pcs", tags: ["фрукт", "перекус"], synonyms: ["бананы"] },
  { name: "Яблоко", category: "Фрукты", calories: 52, protein: 0.3, fat: 0.2, carbs: 14, serving_size: 150, serving_unit: "pcs", tags: ["фрукт"], synonyms: ["яблоки"] },
  { name: "Молоко 2.5%", category: "Молочка", calories: 52, protein: 2.8, fat: 2.5, carbs: 4.7, serving_size: 200, serving_unit: "ml", tags: ["молочка"], synonyms: ["молоко"] },
  { name: "Хлеб белый", category: "Хлеб", calories: 265, protein: 9, fat: 3.2, carbs: 49, serving_size: 30, serving_unit: "pcs", tags: ["углеводы"], synonyms: ["батон", "тост"] },
  { name: "Лосось", category: "Рыба", calories: 208, protein: 20, fat: 13, carbs: 0, serving_size: 100, serving_unit: "g", tags: ["рыба", "белок"], synonyms: ["сёмга", "семга"] },
  { name: "Авокадо", category: "Овощи", calories: 160, protein: 2, fat: 15, carbs: 9, serving_size: 140, serving_unit: "pcs", tags: ["жиры"], synonyms: [] },
  { name: "Брокколи", category: "Овощи", calories: 34, protein: 2.8, fat: 0.4, carbs: 7, serving_size: 100, serving_unit: "g", tags: ["овощи"], synonyms: [] },
  { name: "Картофель", category: "Овощи", calories: 77, protein: 2, fat: 0.1, carbs: 17, serving_size: 150, serving_unit: "g", tags: ["гарнир"], synonyms: ["картошка"] },
  { name: "Сыр твёрдый", category: "Молочка", calories: 356, protein: 25, fat: 27, carbs: 0, serving_size: 30, serving_unit: "g", tags: ["молочка"], synonyms: ["сыр"] },
  { name: "Йогурт натуральный", category: "Молочка", calories: 60, protein: 4, fat: 3, carbs: 4.5, serving_size: 150, serving_unit: "g", tags: ["молочка", "перекус"], synonyms: ["йогурт"] },
  { name: "Говядина", category: "Мясо", calories: 250, protein: 26, fat: 15, carbs: 0, serving_size: 100, serving_unit: "g", tags: ["белок"], synonyms: ["говяжий"] },
  { name: "Индейка", category: "Мясо", calories: 189, protein: 29, fat: 7, carbs: 0, serving_size: 100, serving_unit: "g", tags: ["белок", "диета"], synonyms: [] },
  { name: "Макароны", category: "Крупы", calories: 371, protein: 13, fat: 1.5, carbs: 75, serving_size: 70, serving_unit: "g", tags: ["углеводы"], synonyms: ["паста", "спагетти"] },
  { name: "Орехи грецкие", category: "Орехи", calories: 654, protein: 15, fat: 65, carbs: 14, serving_size: 30, serving_unit: "g", tags: ["перекус", "жиры"], synonyms: ["грецкий орех"] },
  { name: "Арахисовая паста", category: "Орехи", calories: 588, protein: 25, fat: 50, carbs: 20, serving_size: 20, serving_unit: "g", tags: ["перекус"], synonyms: ["паста арахисовая"] },
  { name: "Шоколад тёмный 70%", category: "Сладости", calories: 598, protein: 8, fat: 43, carbs: 46, serving_size: 20, serving_unit: "g", tags: ["сладости"], synonyms: ["шоколад"] },
  { name: "Кофе чёрный", category: "Напитки", calories: 2, protein: 0.1, fat: 0, carbs: 0, serving_size: 200, serving_unit: "ml", tags: ["напиток"], synonyms: ["кофе"] },
  { name: "Протеиновый коктейль", category: "Спортпит", calories: 380, protein: 75, fat: 5, carbs: 8, serving_size: 30, serving_unit: "g", tags: ["белок", "спорт"], synonyms: ["протеин", "whey"] },
  { name: "Салат листовой", category: "Овощи", calories: 15, protein: 1.4, fat: 0.2, carbs: 2.9, serving_size: 50, serving_unit: "g", tags: ["овощи", "диета"], synonyms: ["салат"] },
  { name: "Помидор", category: "Овощи", calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, serving_size: 100, serving_unit: "pcs", tags: ["овощи"], synonyms: ["томат"] },
  { name: "Огурец", category: "Овощи", calories: 15, protein: 0.8, fat: 0.1, carbs: 3.6, serving_size: 100, serving_unit: "pcs", tags: ["овощи"], synonyms: [] },
  { name: "Масло оливковое", category: "Жиры", calories: 884, protein: 0, fat: 100, carbs: 0, serving_size: 10, serving_unit: "ml", tags: ["жиры"], synonyms: ["олива"] },
  { name: "Тунец в собственном соку", category: "Рыба", calories: 116, protein: 26, fat: 1, carbs: 0, serving_size: 100, serving_unit: "g", tags: ["рыба", "белок"], synonyms: ["тунец"] },
  { name: "Сырок глазированный", category: "Сладости", calories: 408, protein: 8, fat: 27, carbs: 33, serving_size: 50, serving_unit: "pcs", tags: ["сладости"], synonyms: ["сырок"] },
];

export function seedIfEmpty() {
  migrate();
  const count = db.prepare("SELECT COUNT(*) as c FROM products").get() as {
    c: number;
  };
  if (count.c > 0) return;

  const insert = db.prepare(`
    INSERT INTO products (
      id, name, category, calories_per_100g, protein_per_100g,
      fat_per_100g, carbs_per_100g, serving_size, serving_unit,
      tags, synonyms, is_verified
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  const tx = db.transaction(() => {
    for (const p of PRODUCTS) {
      insert.run(
        nanoid(),
        p.name,
        p.category,
        p.calories,
        p.protein,
        p.fat,
        p.carbs,
        p.serving_size,
        p.serving_unit,
        JSON.stringify(p.tags),
        JSON.stringify(p.synonyms)
      );
    }
  });
  tx();
  console.log(`Seeded ${PRODUCTS.length} products`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedIfEmpty();
}
