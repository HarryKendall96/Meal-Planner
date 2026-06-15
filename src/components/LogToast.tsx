import { useEffect } from "react";
import { Check } from "lucide-react";

interface Props {
  message: string | null;
  onDone: () => void;
}

/**
 * Brief confirmation when something is logged. NOT a coaching nag (Law #3) —
 * it only ever confirms an action the user just took, then disappears.
 */
export function LogToast({ message, onDone }: Props) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 1600);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-50 flex justify-center px-4">
      <div className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-lg">
        <Check className="size-4 text-confidence-verified" />
        {message}
      </div>
    </div>
  );
}
