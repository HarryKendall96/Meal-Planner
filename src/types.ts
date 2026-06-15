/**
 * Core data models for Tally.
 *
 * Law #2 — the database admits when it's guessing. Every food number carries a
 * `Confidence` so the UI can always show how trustworthy it is.
 */

/** verified = trusted source (green) · user = you saved/corrected it (amber) · estimate = a guess (red) */
export type Confidence = "verified" | "user" | "estimate";

/** A single food line logged into a day. */
export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  confidence: Confidence;
  /** Links back to a CustomFood when this entry came from one, so corrections round-trip. */
  customFoodId?: string;
  /** epoch ms — order within the day */
  createdAt: number;
}

/** A food you saved or corrected. Persists forever and is reusable in one tap (Law #1 / #2). */
export interface CustomFood {
  id: string;
  name: string;
  calories: number;
  /** Typically "user" once you've confirmed the number. */
  confidence: Confidence;
  createdAt: number;
  updatedAt: number;
}

/** Everything logged on a given calendar day. Keyed by `date` (YYYY-MM-DD). */
export interface DayLog {
  date: string;
  entries: FoodEntry[];
  /** Calories burned through logged activity (added on top of the base target). */
  activityCalories: number;
}

/** Stubbed wearable inputs for one night, plus optional user sleep override. */
export interface ReadinessReading {
  date: string;
  sleepHours: number;
  restingHr: number;
  hrv: number;
}

/** A user override of last night's sleep when the tracker got it wrong (Recovery screen). */
export interface SleepOverride {
  date: string;
  sleepHours: number;
}

export type Units = "kg" | "st-lb";
export type ReadinessSensitivity = "calm" | "reactive";

/** The coaching signals that can be individually toggled off — and stay off (Law #3). */
export type CoachingSignalKey = "recovery" | "nutrition" | "consistency";

export interface Settings {
  units: Units;
  calorieTarget: number;
  readinessSensitivity: ReadinessSensitivity;
  /** Off means off, permanently — the coach never re-surfaces a disabled signal. */
  coachingSignals: Record<CoachingSignalKey, boolean>;
}

export const DEFAULT_SETTINGS: Settings = {
  units: "kg",
  calorieTarget: 2000,
  readinessSensitivity: "calm",
  coachingSignals: {
    recovery: true,
    nutrition: true,
    consistency: true,
  },
};
