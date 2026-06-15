import { TABS, type TabId } from "@/navigation/tabs";
import { cn } from "@/lib/utils";

interface Props {
  active: TabId;
  onChange: (id: TabId) => void;
}

/**
 * Law #4 — the interface carries the habit.
 * The bottom tab bar is fixed in the same position on every screen so
 * navigation is muscle-memory. Order never changes between screens.
 */
export function BottomTabBar({ active, onChange }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur pb-safe">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === active;
          return (
            <li key={tab.id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(tab.id)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("size-6", isActive && "stroke-[2.5]")} />
                {tab.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
