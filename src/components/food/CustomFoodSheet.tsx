import { useEffect, useState } from "react";
import type { CustomFood } from "@/types";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { Trash2 } from "lucide-react";

interface Props {
  food: CustomFood | null;
  onOpenChange: (open: boolean) => void;
}

/** Edit/delete a saved custom food. Custom foods persist forever (Law #1/#2). */
export function CustomFoodSheet({ food, onOpenChange }: Props) {
  const upsert = useStore((s) => s.upsertCustomFood);
  const remove = useStore((s) => s.deleteCustomFood);

  const [name, setName] = useState("");
  const [cals, setCals] = useState("");

  useEffect(() => {
    if (food) {
      setName(food.name);
      setCals(String(food.calories));
    }
  }, [food]);

  if (!food) return null;

  function save() {
    if (!food) return;
    const n = parseInt(cals, 10);
    if (!Number.isFinite(n) || n <= 0) return;
    upsert({ id: food.id, name: name.trim() || food.name, calories: n });
    onOpenChange(false);
  }

  return (
    <Sheet open={!!food} onOpenChange={onOpenChange}>
      <SheetContent title="Edit custom food">
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
            onClick={() => {
              remove(food.id);
              onOpenChange(false);
            }}
            aria-label="Delete custom food"
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
