import type { Confidence } from "@/types";

/**
 * STUB SERVICE — fake food database.
 *
 * Replace `FOODS` + `searchFoods` with a real nutrition API (e.g. a verified
 * UK food database). The interface (`FoodResult`, `searchFoods`) is what the UI
 * depends on, so the internals can be swapped without touching any screen.
 *
 * Law #2 — every result carries a `confidence`. At least one item below is a
 * deliberate `estimate` so the red badge is visible in demos.
 */

export interface FoodResult {
  id: string;
  name: string;
  /** kcal for the stated portion */
  calories: number;
  portion: string;
  confidence: Confidence;
}

// --- FAKE DATA (UK-relevant common foods) -------------------------------------
export const FOODS: FoodResult[] = [
  { id: "f-banana", name: "Banana", calories: 105, portion: "1 medium", confidence: "verified" },
  { id: "f-apple", name: "Apple", calories: 95, portion: "1 medium", confidence: "verified" },
  { id: "f-weetabix", name: "Weetabix", calories: 136, portion: "2 biscuits", confidence: "verified" },
  { id: "f-porridge", name: "Porridge (with water)", calories: 171, portion: "40g oats", confidence: "verified" },
  { id: "f-bakedbeans", name: "Baked beans", calories: 162, portion: "half a 415g tin", confidence: "verified" },
  { id: "f-toast-white", name: "Toast (white, 1 slice)", calories: 88, portion: "1 slice", confidence: "verified" },
  { id: "f-toast-brown", name: "Toast (wholemeal, 1 slice)", calories: 82, portion: "1 slice", confidence: "verified" },
  { id: "f-egg-boiled", name: "Egg (boiled)", calories: 78, portion: "1 large", confidence: "verified" },
  { id: "f-egg-fried", name: "Egg (fried)", calories: 90, portion: "1 large", confidence: "verified" },
  { id: "f-milk-semi", name: "Milk (semi-skimmed)", calories: 50, portion: "100ml", confidence: "verified" },
  { id: "f-tea", name: "Tea with milk", calories: 15, portion: "1 mug", confidence: "verified" },
  { id: "f-coffee-white", name: "Coffee (white, no sugar)", calories: 20, portion: "1 mug", confidence: "verified" },
  { id: "f-lucozade", name: "Lucozade Energy Original", calories: 140, portion: "380ml bottle", confidence: "verified" },
  { id: "f-coke", name: "Coca-Cola", calories: 139, portion: "330ml can", confidence: "verified" },
  { id: "f-cocacola-diet", name: "Diet Coke", calories: 1, portion: "330ml can", confidence: "verified" },
  { id: "f-tea-biscuit", name: "Digestive biscuit", calories: 71, portion: "1 biscuit", confidence: "verified" },
  { id: "f-walkers", name: "Walkers Ready Salted crisps", calories: 130, portion: "25g bag", confidence: "verified" },
  { id: "f-chicken-breast", name: "Chicken breast (grilled)", calories: 165, portion: "100g", confidence: "verified" },
  { id: "f-salmon", name: "Salmon fillet (baked)", calories: 208, portion: "100g", confidence: "verified" },
  { id: "f-rice-white", name: "White rice (cooked)", calories: 130, portion: "100g", confidence: "verified" },
  { id: "f-pasta", name: "Pasta (cooked)", calories: 158, portion: "100g", confidence: "verified" },
  { id: "f-jacket", name: "Jacket potato (plain)", calories: 245, portion: "1 medium", confidence: "verified" },
  { id: "f-cheddar", name: "Cheddar cheese", calories: 124, portion: "30g", confidence: "verified" },
  { id: "f-greek-yog", name: "Greek yoghurt (0% fat)", calories: 57, portion: "100g", confidence: "verified" },
  { id: "f-hummus", name: "Hummus", calories: 90, portion: "2 tbsp", confidence: "verified" },
  { id: "f-avocado", name: "Avocado", calories: 240, portion: "1 medium", confidence: "verified" },
  { id: "f-pint-lager", name: "Lager (pint, 4%)", calories: 180, portion: "1 pint", confidence: "verified" },
  { id: "f-wine-red", name: "Red wine", calories: 125, portion: "175ml glass", confidence: "verified" },
  // User-saved style entry (amber) — e.g. a homemade item someone corrected before.
  { id: "f-nans-curry", name: "Nan's chicken curry", calories: 520, portion: "1 bowl", confidence: "user" },
  // Deliberate ESTIMATE (red) — takeaway portions vary wildly, so we admit we're guessing.
  { id: "f-tikka-takeaway", name: "Chicken tikka masala (takeaway)", calories: 1240, portion: "1 portion + naan", confidence: "estimate" },
];

/**
 * Case-insensitive substring search over the stub database.
 * An empty query returns the full list (useful as browse suggestions).
 */
export function searchFoods(query: string): FoodResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return FOODS;
  return FOODS.filter((f) => f.name.toLowerCase().includes(q));
}

export function getFoodById(id: string): FoodResult | undefined {
  return FOODS.find((f) => f.id === id);
}
