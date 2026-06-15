import type { ReadinessReading, ReadinessSensitivity } from "@/types";
import { todayISO, addDays } from "@/lib/date";

/**
 * STUB SERVICE — fake recovery/readiness signal.
 *
 * Inputs (sleep, resting HR, HRV) are hard-coded plausible values. Replace
 * `getReadinessWeek` with a real wearable API (Oura/Whoop/Apple Health) and
 * keep `computeReadiness` (or move it server-side). The interface is the
 * contract the Recovery screen relies on.
 *
 * A REAL HRV PIPELINE would go where `hrv` is consumed below: ingest beat-to-beat
 * intervals, compute RMSSD over the sleep window, normalise to a personal
 * baseline. Here we just treat the stub `hrv` number as already-normalised ms.
 */

export interface ReadinessFactors {
  sleepHours: number;
  restingHr: number;
  hrv: number;
}

// --- FAKE DATA: 7 nights of plausible values, oldest first -------------------
const WEEK_RAW: ReadinessFactors[] = [
  { sleepHours: 6.2, restingHr: 61, hrv: 48 },
  { sleepHours: 7.4, restingHr: 58, hrv: 62 },
  { sleepHours: 8.1, restingHr: 55, hrv: 71 },
  { sleepHours: 5.5, restingHr: 64, hrv: 41 },
  { sleepHours: 7.0, restingHr: 59, hrv: 58 },
  { sleepHours: 7.8, restingHr: 56, hrv: 66 },
  { sleepHours: 6.8, restingHr: 60, hrv: 54 }, // last night (today's reading)
];

/** Returns the week of readings keyed to the last 7 calendar dates (today last). */
export function getReadinessWeek(): ReadinessReading[] {
  const today = todayISO();
  return WEEK_RAW.map((r, i) => ({
    date: addDays(today, i - (WEEK_RAW.length - 1)),
    sleepHours: r.sleepHours,
    restingHr: r.restingHr,
    hrv: r.hrv,
  }));
}

export function getTodayReading(): ReadinessReading {
  const week = getReadinessWeek();
  return week[week.length - 1];
}

/**
 * Compute a 0–100 readiness score from one night's factors.
 *
 * Each factor is scored 0–100 against a simple reference point, then weighted:
 *   sleep 45% · HRV 35% · resting HR 20%.
 *
 * Sensitivity then reshapes the score around a neutral midpoint of 70:
 *   - "calm"     compresses deviations (×0.6)  → smoothed, less jumpy
 *   - "reactive" amplifies deviations (×1.35) → responsive, more volatile
 * Same inputs, visibly different output — that's the whole point of the toggle.
 */
export function computeReadiness(
  factors: ReadinessFactors,
  sensitivity: ReadinessSensitivity
): number {
  // Sleep: 8h is ideal (100), every hour off costs ~12 points.
  const sleepScore = clamp(100 - Math.abs(8 - factors.sleepHours) * 12);

  // Resting HR: 55 bpm is the reference; higher is worse (~2.5 pts/bpm).
  const hrScore = clamp(100 - (factors.restingHr - 55) * 2.5);

  // HRV: 70ms reference (this is where a real RMSSD-vs-baseline calc would sit).
  const hrvScore = clamp(50 + (factors.hrv - 60) * 1.8);

  const base = 0.45 * sleepScore + 0.35 * hrvScore + 0.2 * hrScore;

  const NEUTRAL = 70;
  const factor = sensitivity === "calm" ? 0.6 : 1.35;
  return Math.round(clamp(NEUTRAL + (base - NEUTRAL) * factor));
}

export type ReadinessLabel = "Poor" | "Fair" | "Good";

export function readinessLabel(score: number): ReadinessLabel {
  if (score >= 67) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}
