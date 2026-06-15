import { useMemo, useState } from "react";
import { useStore } from "@/store/useStore";
import { caloriesIn, deficit, computeStreak } from "@/store/selectors";
import { todayISO, prettyDate } from "@/lib/date";
import {
  computeReadiness,
  getReadinessWeek,
  readinessLabel,
} from "@/services/readiness";
import { getInsight, type Insight } from "@/services/coach";
import type { ReadinessSensitivity } from "@/types";

import { SegmentedControl } from "@/components/SegmentedControl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReadinessTrend } from "@/components/recovery/ReadinessTrend";
import { CoachPanel } from "@/components/recovery/CoachPanel";
import { Moon, HeartPulse, Activity } from "lucide-react";

const TONE: Record<string, string> = {
  Good: "text-confidence-verified",
  Fair: "text-confidence-user",
  Poor: "text-confidence-estimate",
};

export function Recovery() {
  const today = todayISO();
  const settings = useStore((s) => s.settings);
  const sleepOverrides = useStore((s) => s.sleepOverrides);
  const setSleepOverride = useStore((s) => s.setSleepOverride);
  const updateSettings = useStore((s) => s.updateSettings);
  const dayLogs = useStore((s) => s.dayLogs);

  const week = useMemo(() => getReadinessWeek(), []);
  const todayReading = week[week.length - 1];

  // Apply a user sleep override for today if one exists.
  const sleepHours = sleepOverrides[today] ?? todayReading.sleepHours;
  const factors = { ...todayReading, sleepHours };
  const score = computeReadiness(factors, settings.readinessSensitivity);
  const label = readinessLabel(score);

  // Trend: recompute each day under current sensitivity, applying any overrides.
  const trend = week.map((r) => ({
    label: prettyDate(r.date).split(" ")[0], // weekday
    score: computeReadiness(
      { ...r, sleepHours: sleepOverrides[r.date] ?? r.sleepHours },
      settings.readinessSensitivity
    ),
  }));

  // --- Editable sleep ---
  const [sleepInput, setSleepInput] = useState(String(sleepHours));

  // --- Ask Coach (invited only) ---
  const [coachVisible, setCoachVisible] = useState(false);
  const [insight, setInsight] = useState<Insight | null>(null);

  function askCoach() {
    const day = dayLogs[today] ?? {
      date: today,
      entries: [],
      activityCalories: 0,
    };
    const result = getInsight({
      caloriesIn: caloriesIn(day),
      target: settings.calorieTarget,
      deficit: deficit(day, settings),
      streak: computeStreak(dayLogs),
      readinessScore: score,
      readinessLabel: label,
      sleepHours,
      enabledSignals: settings.coachingSignals,
    });
    setInsight(result);
    setCoachVisible(true);
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <header>
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Recovery
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Readiness</h1>
      </header>

      {/* Score + label */}
      <div className="rounded-2xl bg-card p-5 text-center shadow-sm">
        <div className={`text-6xl font-extrabold tabular-nums ${TONE[label]}`}>
          {score}
        </div>
        <div className={`text-lg font-bold ${TONE[label]}`}>{label}</div>
        <div className="mt-1 text-xs text-muted-foreground">out of 100</div>
      </div>

      {/* Contributing factors — shown transparently */}
      <div className="grid grid-cols-3 gap-2">
        <Factor icon={<Moon className="size-5" />} label="Sleep" value={`${sleepHours.toFixed(1)}h`} />
        <Factor icon={<HeartPulse className="size-5" />} label="Rest HR" value={`${todayReading.restingHr}`} />
        <Factor icon={<Activity className="size-5" />} label="HRV" value={`${todayReading.hrv}ms`} />
      </div>

      {/* Sensitivity — visibly changes how the score is computed */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-1 font-bold">Sensitivity</div>
        <p className="mb-3 text-xs text-muted-foreground">
          Calm smooths the score; Reactive responds harder to the same inputs.
        </p>
        <SegmentedControl<ReadinessSensitivity>
          options={[
            { value: "calm", label: "Calm" },
            { value: "reactive", label: "Reactive" },
          ]}
          value={settings.readinessSensitivity}
          onChange={(v) => updateSettings({ readinessSensitivity: v })}
        />
      </div>

      {/* Editable sleep override */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-1 font-bold">Last night's sleep</div>
        <p className="mb-3 text-xs text-muted-foreground">
          Tracker got it wrong? Correct it and readiness recomputes.
        </p>
        <div className="flex gap-2">
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={sleepInput}
            onChange={(e) => setSleepInput(e.target.value)}
            className="w-24 text-center font-semibold tabular-nums"
          />
          <Button
            className="flex-1"
            onClick={() => {
              const h = parseFloat(sleepInput);
              if (Number.isFinite(h) && h >= 0 && h <= 24)
                setSleepOverride(today, h);
            }}
          >
            Update sleep
          </Button>
        </div>
      </div>

      {/* 7-day trend */}
      <div className="rounded-2xl bg-card p-4 shadow-sm">
        <div className="mb-2 font-bold">7-day trend</div>
        <ReadinessTrend data={trend} />
      </div>

      {/* Ask Coach — invited only (Law #3) */}
      <Button variant="outline" onClick={askCoach}>
        Ask Coach
      </Button>
      <CoachPanel
        insight={insight}
        visible={coachVisible}
        onDismiss={() => setCoachVisible(false)}
      />
    </div>
  );
}

function Factor({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl bg-card p-3 shadow-sm">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-lg font-bold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
