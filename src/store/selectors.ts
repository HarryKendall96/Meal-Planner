import type { DayLog, Settings } from "@/types";
import { todayISO, addDays } from "@/lib/date";

/** Total calories logged in a day. */
export function caloriesIn(day: DayLog): number {
  return day.entries.reduce((sum, e) => sum + e.calories, 0);
}

/** Calories out = base target + any logged activity. */
export function caloriesOut(day: DayLog, settings: Settings): number {
  return settings.calorieTarget + day.activityCalories;
}

/**
 * Deficit (positive) or surplus (negative) — the single most important number.
 * out - in: eating under your target produces a positive deficit.
 */
export function deficit(day: DayLog, settings: Settings): number {
  return caloriesOut(day, settings) - caloriesIn(day);
}

/**
 * Current streak = consecutive days up to today with at least one logged entry.
 * Law #4: streaks are shown but never used to guilt — this is a count, nothing more.
 */
export function computeStreak(dayLogs: Record<string, DayLog>): number {
  let streak = 0;
  let cursor = todayISO();
  while (true) {
    const day = dayLogs[cursor];
    if (day && day.entries.length > 0) {
      streak += 1;
      cursor = addDays(cursor, -1);
    } else {
      break;
    }
  }
  return streak;
}
