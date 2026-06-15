import type { CoachingSignalKey } from "@/types";
import type { ReadinessLabel } from "./readiness";

/**
 * STUB SERVICE — fake coach.
 *
 * Swap for a real LLM call; keep it invited-only. `getInsight` is ONLY ever
 * called when the user presses "Ask Coach" — never on a timer, never on load.
 *
 * Law #3 — coaching is invited, never imposed. This also respects per-signal
 * toggles: a disabled signal can never produce an insight.
 */

export interface CoachContext {
  caloriesIn: number;
  target: number;
  deficit: number;
  streak: number;
  readinessScore: number;
  readinessLabel: ReadinessLabel;
  sleepHours: number;
  /** Settings toggles — off means off, permanently (Law #3). */
  enabledSignals: Record<CoachingSignalKey, boolean>;
}

export interface Insight {
  id: string;
  signal: CoachingSignalKey;
  title: string;
  /** Short, specific, implementation-intention style — behaviour change, not vibes. */
  body: string;
}

/**
 * Returns a single relevant insight, or null if nothing applies / all signals
 * are off. Picks the most pressing enabled signal for today's data.
 */
export function getInsight(ctx: CoachContext): Insight | null {
  const candidates: Insight[] = [];

  // --- Recovery ---
  if (ctx.enabledSignals.recovery) {
    if (ctx.readinessLabel === "Poor" || ctx.sleepHours < 6.5) {
      candidates.push({
        id: "recovery-low",
        signal: "recovery",
        title: "Protect tonight's sleep",
        body: `Readiness is ${ctx.readinessLabel.toLowerCase()} after ${ctx.sleepHours.toFixed(
          1
        )}h. If/then: when you finish dinner tonight, set a phone-down alarm for 22:30 so you're in bed by 23:00.`,
      });
    } else {
      candidates.push({
        id: "recovery-ok",
        signal: "recovery",
        title: "Good window to train",
        body: `Readiness is ${ctx.readinessLabel.toLowerCase()}. If you've planned a harder session this week, today is a good day to take it.`,
      });
    }
  }

  // --- Nutrition ---
  if (ctx.enabledSignals.nutrition) {
    if (ctx.deficit < 0) {
      candidates.push({
        id: "nutrition-surplus",
        signal: "nutrition",
        title: "Small tweak, not a reset",
        body: `You're ${Math.abs(
          ctx.deficit
        )} kcal over today — that's fine. If/then: when you next feel snacky, have a glass of water and a piece of fruit first.`,
      });
    } else if (ctx.caloriesIn < ctx.target * 0.4) {
      candidates.push({
        id: "nutrition-underfuel",
        signal: "nutrition",
        title: "Front-load protein",
        body: `You've logged little so far. If/then: at your next meal, build the plate around a palm-sized protein source before anything else.`,
      });
    }
  }

  // --- Consistency (never guilt — Law #4) ---
  if (ctx.enabledSignals.consistency) {
    if (ctx.streak === 0) {
      candidates.push({
        id: "consistency-restart",
        signal: "consistency",
        title: "One number counts",
        body: "Logging a single item today rebuilds the habit. If/then: when you finish your next drink or snack, log just that one thing.",
      });
    } else {
      candidates.push({
        id: "consistency-keep",
        signal: "consistency",
        title: "Anchor the habit",
        body: `${ctx.streak} days logged. If/then: when you put the kettle on tomorrow morning, open Tally and log breakfast while it boils.`,
      });
    }
  }

  if (candidates.length === 0) return null;

  // Priority order when several apply: recovery first, then nutrition, then consistency.
  const priority: CoachingSignalKey[] = ["recovery", "nutrition", "consistency"];
  candidates.sort(
    (a, b) => priority.indexOf(a.signal) - priority.indexOf(b.signal)
  );
  return candidates[0];
}

/** Human labels for the coaching signal toggles in Settings. */
export const SIGNAL_LABELS: Record<CoachingSignalKey, { label: string; description: string }> = {
  recovery: {
    label: "Recovery tips",
    description: "Sleep and readiness suggestions.",
  },
  nutrition: {
    label: "Nutrition tips",
    description: "Gentle nudges about today's intake.",
  },
  consistency: {
    label: "Habit tips",
    description: "Logging-habit reminders (never guilt-based).",
  },
};
