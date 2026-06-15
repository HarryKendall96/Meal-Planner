import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type {
  CustomFood,
  DayLog,
  Settings,
  SleepOverride,
} from "@/types";
import { DEFAULT_SETTINGS } from "@/types";

/**
 * Local persistence via IndexedDB (no backend in the MVP).
 * This is the ONLY module that talks to IndexedDB — the store calls these
 * functions so the storage engine can be swapped later without touching the UI.
 */

const DB_NAME = "tally";
const DB_VERSION = 1;

// A single settings record lives under this fixed key.
const SETTINGS_KEY = "app";

interface TallyDB extends DBSchema {
  dayLogs: {
    key: string; // YYYY-MM-DD
    value: DayLog;
  };
  customFoods: {
    key: string; // id
    value: CustomFood;
    indexes: { "by-updated": number };
  };
  sleepOverrides: {
    key: string; // YYYY-MM-DD
    value: SleepOverride;
  };
  settings: {
    key: string;
    value: Settings;
  };
}

let dbPromise: Promise<IDBPDatabase<TallyDB>> | null = null;

function getDB(): Promise<IDBPDatabase<TallyDB>> {
  if (!dbPromise) {
    dbPromise = openDB<TallyDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore("dayLogs", { keyPath: "date" });
        const foods = db.createObjectStore("customFoods", { keyPath: "id" });
        foods.createIndex("by-updated", "updatedAt");
        db.createObjectStore("sleepOverrides", { keyPath: "date" });
        db.createObjectStore("settings");
      },
    });
  }
  return dbPromise;
}

/* ---------- Settings ---------- */

export async function loadSettings(): Promise<Settings> {
  const db = await getDB();
  const stored = await db.get("settings", SETTINGS_KEY);
  // Merge over defaults so new fields added later are always present.
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function saveSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  await db.put("settings", settings, SETTINGS_KEY);
}

/* ---------- Day logs ---------- */

export async function loadAllDayLogs(): Promise<DayLog[]> {
  const db = await getDB();
  return db.getAll("dayLogs");
}

export async function saveDayLog(log: DayLog): Promise<void> {
  const db = await getDB();
  await db.put("dayLogs", log);
}

/* ---------- Custom foods (persist forever) ---------- */

export async function loadCustomFoods(): Promise<CustomFood[]> {
  const db = await getDB();
  return db.getAll("customFoods");
}

export async function saveCustomFood(food: CustomFood): Promise<void> {
  const db = await getDB();
  await db.put("customFoods", food);
}

export async function deleteCustomFood(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("customFoods", id);
}

/* ---------- Sleep overrides ---------- */

export async function loadSleepOverrides(): Promise<SleepOverride[]> {
  const db = await getDB();
  return db.getAll("sleepOverrides");
}

export async function saveSleepOverride(o: SleepOverride): Promise<void> {
  const db = await getDB();
  await db.put("sleepOverrides", o);
}

/* ---------- Demo reset ---------- */

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await Promise.all([
    db.clear("dayLogs"),
    db.clear("customFoods"),
    db.clear("sleepOverrides"),
    db.clear("settings"),
  ]);
}
