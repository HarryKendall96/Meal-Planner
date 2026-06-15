import type { FoodEntry } from "@/types";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { ChevronRight } from "lucide-react";

interface Props {
  entry: FoodEntry;
  onClick: () => void;
}

/** A single logged item. Confidence badge is always visible (Law #2). */
export function FoodEntryRow({ entry, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl bg-card px-3 py-3 text-left shadow-sm transition-colors active:bg-accent"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold">{entry.name}</span>
          <ConfidenceBadge confidence={entry.confidence} />
        </div>
      </div>
      <span className="shrink-0 font-bold tabular-nums">
        {entry.calories.toLocaleString()}
        <span className="ml-1 text-xs font-normal text-muted-foreground">
          kcal
        </span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
