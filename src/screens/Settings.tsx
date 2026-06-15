import { useState } from "react";
import { useStore } from "@/store/useStore";
import type { CoachingSignalKey, Units } from "@/types";
import { SIGNAL_LABELS } from "@/services/coach";
import { unitsLabel } from "@/lib/units";

import { SegmentedControl } from "@/components/SegmentedControl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function Settings() {
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const resetData = useStore((s) => s.resetData);

  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="flex flex-col gap-4 px-4 pt-4">
      <header>
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Settings
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </header>

      {/* Units — Law #4: this MUST hold and never silently revert.
          We persist the exact chosen value (store.updateSettings -> IndexedDB)
          and on load merge over defaults, so a refresh keeps your choice.
          The current value is read straight from persisted state below, which
          is the proof it doesn't revert: what you see is what was saved. */}
      <Card title="Units" subtitle={`Currently showing weights in ${unitsLabel(settings.units)}.`}>
        <SegmentedControl<Units>
          options={[
            { value: "kg", label: "kg" },
            { value: "st-lb", label: "st/lb" },
          ]}
          value={settings.units}
          onChange={(v) => updateSettings({ units: v })}
        />
      </Card>

      {/* Calorie target (manual for MVP) */}
      <Card title="Daily calorie target">
        <Input
          type="number"
          inputMode="numeric"
          value={settings.calorieTarget}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            if (Number.isFinite(n) && n > 0) updateSettings({ calorieTarget: n });
          }}
          className="font-semibold tabular-nums"
        />
      </Card>

      {/* Coaching signals — Law #3: off means off, permanently. No re-prompting. */}
      <Card
        title="Coaching signals"
        subtitle="Off stays off. The coach never re-surfaces a disabled signal, and only ever speaks when you press Ask Coach."
      >
        <div className="flex flex-col divide-y divide-border">
          {(Object.keys(SIGNAL_LABELS) as CoachingSignalKey[]).map((key) => (
            <div key={key} className="flex items-center justify-between py-3">
              <div className="pr-3">
                <div className="font-semibold">{SIGNAL_LABELS[key].label}</div>
                <div className="text-xs text-muted-foreground">
                  {SIGNAL_LABELS[key].description}
                </div>
              </div>
              <Switch
                checked={settings.coachingSignals[key]}
                onCheckedChange={(checked) =>
                  updateSettings({
                    coachingSignals: {
                      ...settings.coachingSignals,
                      [key]: checked,
                    },
                  })
                }
                aria-label={SIGNAL_LABELS[key].label}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Demo reset */}
      <Card title="Data" subtitle="Clears all locally stored data (entries, custom foods, settings).">
        <Button variant="destructive" onClick={() => setConfirmReset(true)}>
          Reset all data
        </Button>
      </Card>

      <p className="pb-2 text-center text-xs text-muted-foreground">
        Tally MVP · data stored locally on this device only.
      </p>

      <Sheet open={confirmReset} onOpenChange={setConfirmReset}>
        <SheetContent title="Reset all data?">
          <p className="mb-4 text-sm text-muted-foreground">
            This permanently deletes everything stored on this device. This can't
            be undone.
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setConfirmReset(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={async () => {
                await resetData();
                setConfirmReset(false);
              }}
            >
              Reset
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card p-4 shadow-sm">
      <div className="mb-1 font-bold">{title}</div>
      {subtitle && (
        <p className="mb-3 text-xs text-muted-foreground">{subtitle}</p>
      )}
      {children}
    </section>
  );
}
