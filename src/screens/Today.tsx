import { useState } from "react";
import { useStore } from "@/store/useStore";
import { caloriesIn, caloriesOut, computeStreak } from "@/store/selectors";
import { todayISO, yesterdayISO, prettyDate } from "@/lib/date";
import { unitsLabel } from "@/lib/units";
import {
  computeReadiness,
  getReadinessWeek,
  readinessLabel,
} from "@/services/readiness";
import type { FoodEntry } from "@/types";
import type { TabId } from "@/navigation/tabs";

import { DeficitHero } from "@/components/DeficitHero";
import { ReadinessCard } from "@/components/ReadinessCard";
import { QuickAddBar } from "@/components/QuickAddBar";
import { FoodEntryRow } from "@/components/FoodEntryRow";
import { EditEntrySheet } from "@/components/EditEntrySheet";
import { Button } from "@/components/ui/button";
import { Flame, CopyCheck } from "lucide-react";

interface Props {
  onNavigate: (tab: TabId) => void;
}

export function Today({ onNavigate }: Props) {
  const today = todayISO();
  const settings = useStore((s) => s.settings);
  const dayLogs = useStore((s) => s.dayLogs);
  const sleepOverrides = useStore((s) => s.sleepOverrides);
  const addEntry = useStore((s) => s.addEntry);
  const copyDay = useStore((s) => s.copyDay);

  const day = dayLogs[today] ?? { date: today, entries: [], activityCalories: 0 };
  const yesterday = dayLogs[yesterdayISO(today)];

  const [editing, setEditing] = useState<FoodEntry | null>(null);

  const inCals = caloriesIn(day);
  const outCals = caloriesOut(day, settings);
  const streak = computeStreak(dayLogs);

  // Readiness — apply a user sleep override if one exists for today.
  const reading = getReadinessWeek().at(-1)!;
  const sleepHours = sleepOverrides[today] ?? reading.sleepHours;
  const score = computeReadiness(
    { ...reading, sleepHours },
    settings.readinessSensitivity
  );
  const label = readinessLabel(score);

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      {/* Header: date · streak · units (Law #4 — units reflect the setting) */}
      <header className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Today
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            {prettyDate(today)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Streak is shown, never used to guilt (Law #4). */}
          <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-sm font-semibold text-orange-600">
            <Flame className="size-4" />
            {streak}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-sm font-semibold text-muted-foreground">
            {unitsLabel(settings.units)}
          </span>
        </div>
      </header>

      {/* Hero: the live deficit — the visual anchor. */}
      <DeficitHero
        caloriesIn={inCals}
        caloriesOut={outCals}
        target={settings.calorieTarget}
      />

      {/* Readiness summary → Recovery tab */}
      <ReadinessCard
        score={score}
        label={label}
        onClick={() => onNavigate("recovery")}
      />

      {/* Food section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">Today's food</h2>
          {yesterday && yesterday.entries.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => copyDay(yesterdayISO(today), today)}
            >
              <CopyCheck className="size-4" />
              Same as yesterday
            </Button>
          )}
        </div>

        {/* Law #1: always-visible one-tap quick add at top of the food section. */}
        <div className="rounded-2xl bg-card p-3 shadow-sm">
          <QuickAddBar
            onAdd={(calories, name) =>
              addEntry(today, { name, calories, confidence: "user" })
            }
          />
        </div>

        {/* Entry list */}
        {day.entries.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
            Nothing logged yet. Add a number above — one tap is all it takes.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {day.entries.map((entry) => (
              <FoodEntryRow
                key={entry.id}
                entry={entry}
                onClick={() => setEditing(entry)}
              />
            ))}
          </div>
        )}
      </section>

      <EditEntrySheet
        date={today}
        entry={editing}
        onOpenChange={(open) => !open && setEditing(null)}
      />
    </div>
  );
}
