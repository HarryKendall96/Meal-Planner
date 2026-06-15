import { Home, UtensilsCrossed, HeartPulse, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TabId = "today" | "food" | "recovery" | "settings";

export interface TabDef {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

// Law #4 — the interface carries the habit: a fixed, consistent tab order on
// every screen. Never reorder these between screens.
export const TABS: TabDef[] = [
  { id: "today", label: "Today", icon: Home },
  { id: "food", label: "Food", icon: UtensilsCrossed },
  { id: "recovery", label: "Recovery", icon: HeartPulse },
  { id: "settings", label: "Settings", icon: Settings },
];
