import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ConfidenceBadge } from "@/components/ConfidenceBadge";
import { useStore } from "@/store/useStore";
import type { CustomFood } from "@/types";
import { Pencil, Plus } from "lucide-react";

interface Props {
  onLog: (food: CustomFood) => void;
  onEdit: (food: CustomFood) => void;
}

/**
 * All foods you've saved or corrected — searchable, editable, reusable in one
 * tap, and persisted forever (Law #1 / Law #2).
 */
export function CustomFoodsList({ onLog, onEdit }: Props) {
  const customFoods = useStore((s) => s.customFoods);
  const [query, setQuery] = useState("");

  const filtered = customFoods
    .filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-bold">Your foods</h2>
      {customFoods.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-card/50 px-4 py-6 text-center text-sm text-muted-foreground">
          Foods you save or correct show up here, ready to reuse in one tap.
        </p>
      ) : (
        <>
          <Input
            placeholder="Search your foods"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            {filtered.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 rounded-xl bg-card px-3 py-2.5 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => onLog(f)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <Plus className="size-5 shrink-0 text-primary" />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-semibold">{f.name}</span>
                      <ConfidenceBadge confidence={f.confidence} />
                    </span>
                  </span>
                </button>
                <span className="shrink-0 text-sm font-bold tabular-nums">
                  {f.calories}
                </span>
                <button
                  type="button"
                  onClick={() => onEdit(f)}
                  aria-label={`Edit ${f.name}`}
                  className="rounded-md p-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Pencil className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
