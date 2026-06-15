import type { Confidence } from "@/types";
import { FOODS } from "./foodDatabase";

/**
 * STUB SERVICE — fake "AI" food parser.
 *
 * Text parsing is naive keyword matching against the stub food DB.
 * Image parsing returns a fixed placeholder.
 *
 * Replace `parseFood` internals with a real LLM / vision model. The interface
 * (`ParseInput`, `FoodDraft`) is the contract the UI relies on.
 *
 * Law #1 / coaching law: AI NEVER auto-commits. This returns an editable DRAFT
 * the user must confirm. Every parsed item is tagged `estimate` (Law #2) —
 * a machine guess is a guess until the user confirms it.
 */

export interface FoodDraftItem {
  name: string;
  calories: number;
  confidence: Confidence;
  /** Which stub food this was matched to, if any. */
  sourceFoodId?: string;
}

export interface FoodDraft {
  source: "text" | "image";
  items: FoodDraftItem[];
  /** Human-readable note about how this draft was produced. */
  note: string;
}

export type ParseInput =
  | { kind: "text"; text: string }
  | { kind: "image"; file?: File };

export function parseFood(input: ParseInput): FoodDraft {
  if (input.kind === "image") return parseImage();
  return parseText(input.text);
}

// --- TEXT: naive keyword + quantity matching ---------------------------------
function parseText(text: string): FoodDraft {
  const lower = text.toLowerCase();
  const items: FoodDraftItem[] = [];
  const usedIds = new Set<string>();

  for (const food of FOODS) {
    // Build simple keywords from the food name (drop short/common words).
    const keywords = food.name
      .toLowerCase()
      .replace(/[(),]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w));

    const hit = keywords.find((k) => lower.includes(k.replace(/s$/, "")));
    if (!hit || usedIds.has(food.id)) continue;

    // Look for a quantity right before the keyword, e.g. "2 eggs".
    const qty = findQuantity(lower, hit) ?? 1;
    usedIds.add(food.id);
    items.push({
      name: qty > 1 ? `${food.name} ×${qty}` : food.name,
      calories: food.calories * qty,
      confidence: "estimate", // a parse is a guess until confirmed
      sourceFoodId: food.id,
    });
  }

  return {
    source: "text",
    items,
    note: items.length
      ? "Parsed by keyword match — check the numbers before saving."
      : "Couldn't recognise anything. Edit below or use Quick number.",
  };
}

function findQuantity(text: string, keyword: string): number | null {
  const root = keyword.replace(/s$/, "");
  const re = new RegExp(`(\\d+)\\s+${root}`, "i");
  const m = text.match(re);
  return m ? Math.min(parseInt(m[1], 10), 20) : null;
}

const STOPWORDS = new Set([
  "the", "and", "with", "fat", "slice", "medium", "large", "tin", "can",
  "bottle", "mug", "glass", "pint", "original", "energy", "plain",
]);

// --- IMAGE: fixed placeholder ------------------------------------------------
function parseImage(): FoodDraft {
  // TODO: replace with a real vision model. For now we return a fixed draft so
  // the photo door is demonstrable end-to-end without any network calls.
  return {
    source: "image",
    items: [
      {
        name: "Meal from photo",
        calories: 600,
        confidence: "estimate",
        sourceFoodId: undefined,
      },
    ],
    note: "Placeholder vision result — replace with real vision model. Edit before saving.",
  };
}
