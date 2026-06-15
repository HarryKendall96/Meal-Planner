import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  onAdd: (calories: number, name: string) => void;
  autoFocus?: boolean;
}

/**
 * Law #1 — the core habit is sacred.
 * Logging a known calorie number is ALWAYS one tap: type a number, hit Add.
 * No menus, no chat, never gated. This bar lives at the top of the food section
 * on Today and is reused inside the floating "+ Log" sheet.
 */
export function QuickAddBar({ onAdd, autoFocus }: Props) {
  const [cals, setCals] = useState("");
  const [name, setName] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseInt(cals, 10);
    if (!Number.isFinite(n) || n <= 0) return;
    // A number you typed yourself is your own data → "user" confidence.
    onAdd(n, name.trim() || "Quick add");
    setCals("");
    setName("");
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          type="number"
          inputMode="numeric"
          autoFocus={autoFocus}
          placeholder="Calories"
          value={cals}
          onChange={(e) => setCals(e.target.value)}
          className="w-28 text-center font-semibold tabular-nums"
          aria-label="Calories"
        />
        <Input
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
          aria-label="Name"
        />
      </div>
      <Button type="submit" className="w-full" disabled={!cals}>
        Add calories
      </Button>
    </form>
  );
}
