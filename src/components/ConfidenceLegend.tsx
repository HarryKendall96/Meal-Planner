import { ConfidenceBadge } from "./ConfidenceBadge";

/**
 * Law #2 — explains what the confidence colours mean, always available so the
 * user can read the badges. Green = trusted, amber = yours, red = a guess.
 */
export function ConfidenceLegend() {
  return (
    <div className="rounded-xl bg-card p-3 text-xs text-muted-foreground shadow-sm">
      <div className="mb-2 font-semibold text-foreground">How sure are we?</div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <ConfidenceBadge confidence="verified" />
          <span>Trusted source.</span>
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceBadge confidence="user" />
          <span>A number you saved or corrected.</span>
        </div>
        <div className="flex items-center gap-2">
          <ConfidenceBadge confidence="estimate" />
          <span>A guess — check it before trusting it.</span>
        </div>
      </div>
    </div>
  );
}
