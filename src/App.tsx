import { useState } from "react";
import { BottomTabBar } from "@/components/BottomTabBar";
import { LogButton } from "@/components/LogButton";
import { Placeholder } from "@/screens/Placeholder";
import type { TabId } from "@/navigation/tabs";

export default function App() {
  const [tab, setTab] = useState<TabId>("today");

  return (
    // Mobile-first frame: capped at a phone width and centred so it feels like
    // a native app, not a stretched desktop site.
    <div className="relative mx-auto flex min-h-full max-w-md flex-col bg-background shadow-sm">
      {/* Scrollable content area. Bottom padding clears the fixed tab bar. */}
      <main className="flex-1 overflow-y-auto pb-28">
        {tab === "today" && (
          <Placeholder title="Today" subtitle="Your live deficit, at a glance." />
        )}
        {tab === "food" && (
          <Placeholder title="Food" subtitle="Three equal ways to log." />
        )}
        {tab === "recovery" && (
          <Placeholder
            title="Recovery"
            subtitle="Readiness, on your terms."
          />
        )}
        {tab === "settings" && (
          <Placeholder title="Settings" subtitle="Units, target, signals." />
        )}
      </main>

      {/* Law #1 + #4: the Log button is always present, same spot everywhere. */}
      <LogButton onClick={() => setTab("today")} />
      <BottomTabBar active={tab} onChange={setTab} />
    </div>
  );
}
