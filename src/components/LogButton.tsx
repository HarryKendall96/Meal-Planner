import { Plus } from "lucide-react";

interface Props {
  onClick: () => void;
}

/**
 * Law #1 — the core habit is sacred, and Law #4 — the interface carries it.
 * This floating "+ Log" button sits in the exact same position on every
 * screen and is never gated. One tap opens the quick-add calorie field.
 */
export function LogButton({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Log calories"
      className="fixed bottom-[calc(env(safe-area-inset-bottom,0px)+4.5rem)] right-4 z-50 flex h-14 items-center gap-2 rounded-full bg-primary pl-4 pr-5 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-transform active:scale-95"
    >
      <Plus className="size-6" strokeWidth={2.5} />
      Log
    </button>
  );
}
