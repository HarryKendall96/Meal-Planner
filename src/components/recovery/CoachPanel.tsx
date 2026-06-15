import type { Insight } from "@/services/coach";
import { Button } from "@/components/ui/button";
import { X, Lightbulb } from "lucide-react";

interface Props {
  insight: Insight | null;
  /** Shown only after the user presses "Ask Coach" (Law #3). */
  visible: boolean;
  onDismiss: () => void;
}

/**
 * Law #3 — coaching is invited, never imposed. This panel renders ONLY after the
 * user presses "Ask Coach", and is always dismissible. If every signal is off it
 * says so rather than inventing something.
 */
export function CoachPanel({ insight, visible, onDismiss }: Props) {
  if (!visible) return null;

  return (
    <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 font-bold">
          <Lightbulb className="size-5 text-primary" />
          {insight ? insight.title : "Nothing to suggest"}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="rounded-md p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
      {insight ? (
        <p className="text-sm leading-relaxed text-foreground">{insight.body}</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          All coaching signals are switched off in Settings. Turn one on if you'd
          like suggestions here — they'll still only appear when you ask.
        </p>
      )}
      <Button variant="ghost" size="sm" className="mt-2" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  );
}
