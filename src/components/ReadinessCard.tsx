import { ChevronRight, HeartPulse } from "lucide-react";
import type { ReadinessLabel } from "@/services/readiness";

interface Props {
  score: number;
  label: ReadinessLabel;
  onClick: () => void;
}

const TONE: Record<ReadinessLabel, string> = {
  Good: "text-confidence-verified",
  Fair: "text-confidence-user",
  Poor: "text-confidence-estimate",
};

/** Compact readiness summary on Today. Tapping it goes to the Recovery tab. */
export function ReadinessCard({ score, label, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-2xl bg-card p-4 text-left shadow-sm transition-colors active:bg-accent"
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
        <HeartPulse className={`size-6 ${TONE[label]}`} />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium text-muted-foreground">
          Readiness
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-extrabold tabular-nums ${TONE[label]}`}>
            {score}
          </span>
          <span className="text-sm font-semibold">{label}</span>
        </div>
      </div>
      <ChevronRight className="size-5 text-muted-foreground" />
    </button>
  );
}
