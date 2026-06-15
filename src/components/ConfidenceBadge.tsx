import type { Confidence } from "@/types";
import { cn } from "@/lib/utils";
import { ShieldCheck, UserCheck, HelpCircle } from "lucide-react";

/**
 * Law #2 — the database admits when it's guessing.
 * This badge is ALWAYS rendered on a food entry/result so the user can see how
 * trustworthy the number is: verified (green) · user (amber) · estimate (red).
 */

const CONFIG: Record<
  Confidence,
  { label: string; className: string; Icon: typeof ShieldCheck }
> = {
  verified: {
    label: "Verified",
    className: "bg-confidence-verified/15 text-confidence-verified",
    Icon: ShieldCheck,
  },
  user: {
    label: "Yours",
    className: "bg-confidence-user/15 text-confidence-user",
    Icon: UserCheck,
  },
  estimate: {
    label: "Estimate",
    className: "bg-confidence-estimate/15 text-confidence-estimate",
    Icon: HelpCircle,
  },
};

interface Props {
  confidence: Confidence;
  /** Compact dot+label vs icon+label */
  className?: string;
}

export function ConfidenceBadge({ confidence, className }: Props) {
  const { label, className: tone, Icon } = CONFIG[confidence];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tone,
        className
      )}
    >
      <Icon className="size-3" />
      {label}
    </span>
  );
}
