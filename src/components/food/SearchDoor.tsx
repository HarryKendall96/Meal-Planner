import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { searchFoods } from "@/services/foodDatabase";
import type { FoodResult } from "@/services/foodDatabase";
import { Plus } from "lucide-react";

interface Props {
  onLog: (result: FoodResult) => void;
}

/** Door 2 — search the (stubbed) food database. Results show confidence badges. */
export function SearchDoor({ onLog }: Props) {
  const [query, setQuery] = useState("");
  const results = searchFoods(query);

  return (
    <div className="flex flex-col gap-2">
      <Input
        autoFocus
        placeholder="Search foods (e.g. Weetabix)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
        {results.length === 0 ? (
          <p className="px-1 py-4 text-center text-sm text-muted-foreground">
            No matches. Try the Quick number or Describe door.
          </p>
        ) : (
          results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onLog(r)}
              className="flex items-center gap-3 rounded-xl bg-card px-3 py-3 text-left shadow-sm transition-colors active:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-semibold">{r.name}</span>
                  <ConfidenceBadge confidence={r.confidence} />
                </div>
                <div className="text-xs text-muted-foreground">{r.portion}</div>
              </div>
              <span className="shrink-0 font-bold tabular-nums">
                {r.calories}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  kcal
                </span>
              </span>
              <Plus className="size-5 shrink-0 text-primary" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
