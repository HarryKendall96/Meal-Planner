import { useEffect, useState } from "react";
import type { FoodEntry } from "@/types";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { useStore } from "@/store/useStore";
import { Trash2 } from "lucide-react";

interface Props {
  date: string;
  entry: FoodEntry | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Edit sheet for a logged entry.
 * Law #2: correcting an amber/red entry promotes it toward "user" confidence
 * and saves the correction to custom foods, so the same food never shows the
 * wrong number twice. (The promotion + save lives in store.updateEntry.)
 */
export function EditEntrySheet({ date, entry, onOpenChange }: Props) {
  const updateEntry = useStore((s) => s.updateEntry);
  const deleteEntry = useStore((s) => s.deleteEntry);

  const [name, setName] = useState("");
  const [cals, setCals] = useState("");

  // Reset fields whenever a new entry is opened.
  useEffect(() => {
    if (entry) {
      setName(entry.name);
      setCals(String(entry.calories));
    }
  }, [entry]);

  if (!entry) return null;

  const changed =
    name.trim() !== entry.name || parseInt(cals, 10) !== entry.calories;

  function save() {
    if (!entry) return;
    const n = parseInt(cals, 10);
    if (!Number.isFinite(n) || n <= 0) return;
    updateEntry(
      date,
      entry.id,
      { name: name.trim() || entry.name, calories: n },
      // Only a non-verified entry's edit is treated as a correction worth saving.
      { saveCorrection: entry.confidence !== "verified" }
    );
    onOpenChange(false);
  }

  function remove() {
    if (!entry) return;
    deleteEntry(date, entry.id);
    onOpenChange(false);
  }

  return (
    <Sheet open={!!entry} onOpenChange={onOpenChange}>
      <SheetContent title="Edit entry">
        <div className="mb-3 flex items-center gap-2">
          <ConfidenceBadge confidence={entry.confidence} />
          {entry.confidence !== "verified" && changed && (
            <span className="text-xs text-muted-foreground">
              Saving will mark this as yours & remember it.
            </span>
          )}
        </div>

        <label className="mb-1 block text-sm font-medium">Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3"
        />

        <label className="mb-1 block text-sm font-medium">Calories</label>
        <Input
          type="number"
          inputMode="numeric"
          value={cals}
          onChange={(e) => setCals(e.target.value)}
          className="mb-4 font-semibold tabular-nums"
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={remove}
            aria-label="Delete entry"
          >
            <Trash2 className="size-5 text-destructive" />
          </Button>
          <Button className="flex-1" onClick={save} disabled={!cals}>
            Save
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
