import { Sheet, SheetContent } from "@/components/ui/sheet";
import { QuickAddBar } from "./QuickAddBar";
import { useStore } from "@/store/useStore";
import { todayISO } from "@/lib/date";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Law #1 — the core habit is sacred.
 * The floating "+ Log" button opens this from ANY screen, so logging a known
 * number is always one tap away, never gated behind a menu or chat.
 */
export function QuickLogSheet({ open, onOpenChange }: Props) {
  const addEntry = useStore((s) => s.addEntry);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Quick log">
        <QuickAddBar
          autoFocus
          onAdd={(calories, name) => {
            addEntry(todayISO(), { name, calories, confidence: "user" });
            onOpenChange(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
