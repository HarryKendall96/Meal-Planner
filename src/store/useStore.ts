import { create } from "zustand";
import type {
  Confidence,
  CustomFood,
  DayLog,
  FoodEntry,
  Settings,
} from "@/types";
import { DEFAULT_SETTINGS } from "@/types";
import * as db from "@/lib/db";

/**
 * In-memory app state, hydrated from IndexedDB on boot and write-through
 * persisted on every mutation. Components never touch the DB directly — they
 * call these actions, so the persistence engine stays swappable.
 */

function newId(): string {
  return crypto.randomUUID();
}

function emptyDay(date: string): DayLog {
  return { date, entries: [], activityCalories: 0 };
}

interface StoreState {
  hydrated: boolean;
  settings: Settings;
  dayLogs: Record<string, DayLog>;
  customFoods: CustomFood[];
  /** date -> overridden sleep hours */
  sleepOverrides: Record<string, number>;

  hydrate: () => Promise<void>;

  // --- Day log reads ---
  getDay: (date: string) => DayLog;

  // --- Logging (Law #1: always one tap, never gated) ---
  addEntry: (
    date: string,
    input: { name: string; calories: number; confidence: Confidence; customFoodId?: string }
  ) => void;
  /** Log a saved custom food in one tap. */
  logCustomFood: (date: string, customFoodId: string) => void;
  updateEntry: (
    date: string,
    entryId: string,
    patch: { name?: string; calories?: number },
    opts?: { saveCorrection?: boolean }
  ) => void;
  deleteEntry: (date: string, entryId: string) => void;
  setActivityCalories: (date: string, calories: number) => void;
  /** "Same as yesterday?" — copy a full day's entries into another day. */
  copyDay: (fromDate: string, toDate: string) => void;

  // --- Custom foods (Law #2: corrections persist forever) ---
  upsertCustomFood: (input: { id?: string; name: string; calories: number; confidence?: Confidence }) => CustomFood;
  deleteCustomFood: (id: string) => void;

  // --- Recovery ---
  setSleepOverride: (date: string, sleepHours: number) => void;

  // --- Settings ---
  updateSettings: (patch: Partial<Settings>) => void;

  // --- Demo reset ---
  resetData: () => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  hydrated: false,
  settings: DEFAULT_SETTINGS,
  dayLogs: {},
  customFoods: [],
  sleepOverrides: {},

  hydrate: async () => {
    const [settings, logs, foods, overrides] = await Promise.all([
      db.loadSettings(),
      db.loadAllDayLogs(),
      db.loadCustomFoods(),
      db.loadSleepOverrides(),
    ]);
    set({
      settings,
      dayLogs: Object.fromEntries(logs.map((l) => [l.date, l])),
      customFoods: foods,
      sleepOverrides: Object.fromEntries(
        overrides.map((o) => [o.date, o.sleepHours])
      ),
      hydrated: true,
    });
  },

  getDay: (date) => get().dayLogs[date] ?? emptyDay(date),

  addEntry: (date, input) => {
    const day = get().getDay(date);
    const entry: FoodEntry = {
      id: newId(),
      name: input.name,
      calories: Math.round(input.calories),
      confidence: input.confidence,
      customFoodId: input.customFoodId,
      createdAt: Date.now(),
    };
    const updated: DayLog = { ...day, entries: [...day.entries, entry] };
    set((s) => ({ dayLogs: { ...s.dayLogs, [date]: updated } }));
    void db.saveDayLog(updated);
  },

  logCustomFood: (date, customFoodId) => {
    const food = get().customFoods.find((f) => f.id === customFoodId);
    if (!food) return;
    get().addEntry(date, {
      name: food.name,
      calories: food.calories,
      confidence: food.confidence,
      customFoodId: food.id,
    });
  },

  updateEntry: (date, entryId, patch, opts) => {
    const day = get().getDay(date);
    const existing = day.entries.find((e) => e.id === entryId);
    if (!existing) return;

    // Law #2: correcting an amber/red entry promotes its confidence toward
    // "user" and saves the correction so the same food never shows wrong twice.
    const caloriesChanged =
      patch.calories !== undefined && patch.calories !== existing.calories;
    const promote = opts?.saveCorrection && existing.confidence !== "verified";

    const updatedEntry: FoodEntry = {
      ...existing,
      name: patch.name ?? existing.name,
      calories:
        patch.calories !== undefined
          ? Math.round(patch.calories)
          : existing.calories,
      confidence: promote ? "user" : existing.confidence,
    };

    const updatedDay: DayLog = {
      ...day,
      entries: day.entries.map((e) => (e.id === entryId ? updatedEntry : e)),
    };
    set((s) => ({ dayLogs: { ...s.dayLogs, [date]: updatedDay } }));
    void db.saveDayLog(updatedDay);

    // Persist the correction to custom foods so it's reused next time.
    if (opts?.saveCorrection && (caloriesChanged || patch.name)) {
      const saved = get().upsertCustomFood({
        id: existing.customFoodId,
        name: updatedEntry.name,
        calories: updatedEntry.calories,
        confidence: "user",
      });
      // Link the entry back to the custom food it now corresponds to.
      if (!updatedEntry.customFoodId) {
        const relinked: DayLog = {
          ...updatedDay,
          entries: updatedDay.entries.map((e) =>
            e.id === entryId ? { ...e, customFoodId: saved.id } : e
          ),
        };
        set((s) => ({ dayLogs: { ...s.dayLogs, [date]: relinked } }));
        void db.saveDayLog(relinked);
      }
    }
  },

  deleteEntry: (date, entryId) => {
    const day = get().getDay(date);
    const updated: DayLog = {
      ...day,
      entries: day.entries.filter((e) => e.id !== entryId),
    };
    set((s) => ({ dayLogs: { ...s.dayLogs, [date]: updated } }));
    void db.saveDayLog(updated);
  },

  setActivityCalories: (date, calories) => {
    const day = get().getDay(date);
    const updated: DayLog = {
      ...day,
      activityCalories: Math.max(0, Math.round(calories)),
    };
    set((s) => ({ dayLogs: { ...s.dayLogs, [date]: updated } }));
    void db.saveDayLog(updated);
  },

  copyDay: (fromDate, toDate) => {
    const from = get().getDay(fromDate);
    const to = get().getDay(toDate);
    const cloned: FoodEntry[] = from.entries.map((e) => ({
      ...e,
      id: newId(),
      createdAt: Date.now(),
    }));
    const updated: DayLog = { ...to, entries: [...to.entries, ...cloned] };
    set((s) => ({ dayLogs: { ...s.dayLogs, [toDate]: updated } }));
    void db.saveDayLog(updated);
  },

  upsertCustomFood: ({ id, name, calories, confidence }) => {
    const now = Date.now();
    const existing = id
      ? get().customFoods.find((f) => f.id === id)
      : undefined;
    const food: CustomFood = existing
      ? {
          ...existing,
          name,
          calories: Math.round(calories),
          confidence: confidence ?? existing.confidence,
          updatedAt: now,
        }
      : {
          id: id ?? newId(),
          name,
          calories: Math.round(calories),
          confidence: confidence ?? "user",
          createdAt: now,
          updatedAt: now,
        };
    set((s) => ({
      customFoods: existing
        ? s.customFoods.map((f) => (f.id === food.id ? food : f))
        : [...s.customFoods, food],
    }));
    void db.saveCustomFood(food);
    return food;
  },

  deleteCustomFood: (id) => {
    set((s) => ({ customFoods: s.customFoods.filter((f) => f.id !== id) }));
    void db.deleteCustomFood(id);
  },

  setSleepOverride: (date, sleepHours) => {
    set((s) => ({
      sleepOverrides: { ...s.sleepOverrides, [date]: sleepHours },
    }));
    void db.saveSleepOverride({ date, sleepHours });
  },

  // Law #4: units (and every other setting) must hold. We persist the exact
  // chosen value and merge over defaults on load — nothing silently reverts.
  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    set({ settings: next });
    void db.saveSettings(next);
  },

  resetData: async () => {
    await db.clearAllData();
    set({
      settings: DEFAULT_SETTINGS,
      dayLogs: {},
      customFoods: [],
      sleepOverrides: {},
    });
  },
}));
