import type { Units } from "@/types";

/** Short label for the units indicator. Law #4: this must reflect the setting. */
export function unitsLabel(units: Units): string {
  return units === "kg" ? "kg" : "st/lb";
}
