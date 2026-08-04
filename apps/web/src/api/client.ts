import type {
  GoalType,
  MealEntry,
  Product,
  UserProfile,
} from "@calorie/shared";
import { getInitData } from "../lib/telegram";

/** In production set VITE_API_URL to your API origin, e.g. https://api.example.com */
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const initData = getInitData();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init?.headers as Record<string, string>),
  };
  if (initData) headers.Authorization = `tma ${initData}`;

  const res = await fetch(apiUrl(path), { ...init, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  me: () => request<UserProfile>("/api/me"),
  updateMe: (body: Partial<UserProfile> & { complete_onboarding?: boolean }) =>
    request<UserProfile>("/api/me", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  searchProducts: (q: string) =>
    request<Product[]>(`/api/products?q=${encodeURIComponent(q)}`),
  getProduct: (id: string) => request<Product>(`/api/products/${id}`),
  recentProducts: () => request<Product[]>("/api/products/recent"),
  favorites: () => request<Product[]>("/api/favorites"),
  addFavorite: (product_id: string) =>
    request<{ ok: boolean }>("/api/favorites", {
      method: "POST",
      body: JSON.stringify({ product_id }),
    }),
  removeFavorite: (productId: string) =>
    request<void>(`/api/favorites/${productId}`, { method: "DELETE" }),
  diary: (date?: string) =>
    request<{
      date: string;
      target: number;
      totals: { calories: number; protein: number; fat: number; carbs: number };
      remaining_calories: number;
      entries: MealEntry[];
    }>(`/api/diary${date ? `?date=${date}` : ""}`),
  addMeal: (body: {
    product_id: string;
    quantity: number;
    unit: string;
    meal_type?: string;
  }) =>
    request<MealEntry>("/api/diary", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  deleteMeal: (id: string) =>
    request<void>(`/api/diary/${id}`, { method: "DELETE" }),
  repeatLast: () =>
    request<MealEntry>("/api/diary/repeat-last", { method: "POST" }),
  history: () =>
    request<{
      target: number;
      days: Array<{
        date: string;
        calories: number;
        protein: number;
        fat: number;
        carbs: number;
        entries_count: number;
      }>;
    }>("/api/history"),
};

export type { GoalType, Product, MealEntry, UserProfile };
