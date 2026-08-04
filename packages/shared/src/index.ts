export type GoalType = "lose" | "maintain" | "gain";
export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type ServingUnit = "g" | "ml" | "pcs";

export interface Product {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  serving_size: number;
  serving_unit: ServingUnit;
  tags: string[];
  synonyms?: string[];
  is_verified: boolean;
}

export interface MealEntry {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  unit: ServingUnit;
  calories_total: number;
  protein_total: number;
  fat_total: number;
  carbs_total: number;
  meal_type: MealType;
  created_at: string;
  entry_date?: string;
  product_name?: string;
}

export interface UserProfile {
  id: string;
  telegram_id: number;
  goal_type: GoalType | null;
  daily_calorie_target: number;
  height: number | null;
  weight: number | null;
  age: number | null;
  sex: string | null;
  activity_level: string | null;
  onboarded_at: string | null;
}

export interface MacroTotals {
  calories_total: number;
  protein_total: number;
  fat_total: number;
  carbs_total: number;
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Convert user quantity+unit to grams using product serving_size for pcs. */
export function gramsFromQuantity(
  quantity: number,
  unit: ServingUnit,
  servingSize: number
): number {
  if (unit === "pcs") return quantity * servingSize;
  return quantity;
}

export function macrosFromGrams(
  product: Pick<
    Product,
    | "calories_per_100g"
    | "protein_per_100g"
    | "fat_per_100g"
    | "carbs_per_100g"
  >,
  grams: number
): MacroTotals {
  const k = grams / 100;
  return {
    calories_total: round1(product.calories_per_100g * k),
    protein_total: round1(product.protein_per_100g * k),
    fat_total: round1(product.fat_per_100g * k),
    carbs_total: round1(product.carbs_per_100g * k),
  };
}

export function calcMealMacros(
  product: Pick<
    Product,
    | "calories_per_100g"
    | "protein_per_100g"
    | "fat_per_100g"
    | "carbs_per_100g"
    | "serving_size"
  >,
  quantity: number,
  unit: ServingUnit
): MacroTotals {
  const grams = gramsFromQuantity(quantity, unit, product.serving_size);
  return macrosFromGrams(product, grams);
}
