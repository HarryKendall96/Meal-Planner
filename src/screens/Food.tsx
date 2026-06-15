import { useState } from "react";
import { useStore } from "@/store/useStore";
import { todayISO } from "@/lib/date";
import type { CustomFood } from "@/types";
import type { FoodResult } from "@/services/foodDatabase";

import { SegmentedControl } from "@/components/SegmentedControl";
import { QuickAddBar } from "@/components/QuickAddBar";
import { SearchDoor } from "@/components/food/SearchDoor";
import { DescribeDoor } from "@/components/food/DescribeDoor";
import { CustomFoodsList } from "@/components/food/CustomFoodsList";
import { CustomFoodSheet } from "@/components/food/CustomFoodSheet";
import { ConfidenceLegend } from "@/components/ConfidenceLegend";
import { LogToast } from "@/components/LogToast";

type Door = "quick" | "search" | "describe";

const DOORS = [
  { value: "quick", label: "Quick number" },
  { value: "search", label: "Search" },
  { value: "describe", label: "Describe" },
] as const;

export function Food() {
  const today = todayISO();
  const addEntry = useStore((s) => s.addEntry);
  const logCustomFood = useStore((s) => s.logCustomFood);

  // Three equal doors. We default to Search, but none is privileged — Quick is
  // also always reachable here and via the floating + Log button (Law #1).
  const [door, setDoor] = useState<Door>("search");
  const [editing, setEditing] = useState<CustomFood | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function logResult(r: FoodResult) {
    addEntry(today, { name: r.name, calories: r.calories, confidence: r.confidence });
    setToast(`Added ${r.name}`);
  }

  function logCustom(f: CustomFood) {
    logCustomFood(today, f.id);
    setToast(`Added ${f.name}`);
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <header>
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Log food
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Three ways to log</h1>
        <p className="text-sm text-muted-foreground">
          Pick whichever is easiest right now.
        </p>
      </header>

      <SegmentedControl
        options={DOORS as unknown as { value: Door; label: string }[]}
        value={door}
        onChange={setDoor}
      />

      <div className="rounded-2xl bg-card p-3 shadow-sm">
        {door === "quick" && (
          <QuickAddBar
            autoFocus
            onAdd={(calories, name) => {
              addEntry(today, { name, calories, confidence: "user" });
              setToast(`Added ${name}`);
            }}
          />
        )}
        {door === "search" && <SearchDoor onLog={logResult} />}
        {door === "describe" && (
          <DescribeDoor
            onConfirm={(items) => {
              // Confirmed AI drafts save as estimates (the user can correct later).
              items.forEach((it) =>
                addEntry(today, {
                  name: it.name,
                  calories: it.calories,
                  confidence: "estimate",
                })
              );
              setToast(
                items.length === 1
                  ? `Added ${items[0].name}`
                  : `Added ${items.length} items`
              );
            }}
          />
        )}
      </div>

      <ConfidenceLegend />

      <CustomFoodsList onLog={logCustom} onEdit={setEditing} />

      <CustomFoodSheet
        food={editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />
      <LogToast message={toast} onDone={() => setToast(null)} />
    </div>
  );
}
