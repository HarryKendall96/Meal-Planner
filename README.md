# Tally — a fast, honest calorie & recovery tracker (MVP)

Tally is a mobile-first web app for calorie tracking and recovery. The guiding
principle behind every decision: **AI lowers the cost of the core habit, never
raises it.** When a feature would add friction to logging, the lower-friction
option wins.

This is an **MVP**: four screens, real local persistence, no backend. Food
search, the AI parser, readiness, and the coach are all **stubbed** behind clean,
swappable interfaces (see *What's stubbed* below).

---

## Live demo

Deployed via GitHub Pages: **https://harrykendall96.github.io/Meal-Planner/**

On iPhone, tap **Share → Add to Home Screen** for a full-screen, app-like icon.
Your data is stored locally on the device (IndexedDB) and survives refreshes.

## Run it locally

Requires Node 18+.

```bash
npm install
npm run dev      # http://localhost:5173  (view at ~390px wide / on a phone)
```

Other scripts:

```bash
npm run build    # type-check (tsc -b) + production build to dist/
npm run preview  # serve the production build
npm run lint     # tsc --noEmit
```

## Tech stack

React + TypeScript (strict) · Vite · Tailwind CSS · shadcn/ui-style components ·
Zustand (state) · IndexedDB via `idb` (persistence) · Recharts (charts).
Single-page app with bottom-tab navigation. No backend, no API keys, no external
network calls.

---

## The four design laws (and where each is enforced)

These are treated as acceptance criteria. Each is commented inline in the code at
the point of enforcement.

### Law #1 — The core habit is sacred
Logging a known calorie number is always **one tap**, never gated.
- `src/components/QuickAddBar.tsx` — the number-first quick-add field.
- `src/components/LogButton.tsx` + `src/components/QuickLogSheet.tsx` — the
  floating **+ Log** button opens quick-add from *any* screen.
- `src/screens/Today.tsx` — quick-add sits at the top of the food section.
- Custom foods persist forever and are reusable in one tap:
  `src/components/food/CustomFoodsList.tsx`, `src/store/useStore.ts`.

### Law #2 — The database admits when it's guessing
Every food number carries a confidence badge: **verified** (green), **user**
(amber), **estimate** (red), always visible.
- `src/types.ts` — `Confidence` is part of the data model.
- `src/components/ConfidenceBadge.tsx` — the always-visible badge.
- `src/components/ConfidenceLegend.tsx` — explains the colours.
- Correcting an amber/red entry promotes it toward **user** and saves the
  correction to custom foods, so the same food is never wrong twice:
  `src/store/useStore.ts` → `updateEntry`, surfaced via
  `src/components/EditEntrySheet.tsx`.
- The stub DB ships at least one deliberate **estimate** (takeaway tikka masala):
  `src/services/foodDatabase.ts`.

### Law #3 — Coaching is invited, never imposed
No automatic pop-ups, nags, or unsolicited notifications anywhere. All coaching
lives behind an explicit **Ask Coach** button, and disabled signals stay off.
- `src/services/coach.ts` — `getInsight` is only ever called on demand and
  respects per-signal toggles.
- `src/screens/Recovery.tsx` + `src/components/recovery/CoachPanel.tsx` — the
  panel renders only after the button is pressed, and is dismissible.
- `src/screens/Settings.tsx` — per-signal on/off toggles; off is persisted and
  never re-prompted.

### Law #4 — The interface carries the habit
Same fixed log button position on every screen; streaks shown but never used to
guilt; bright, fast, consistent. Settings (esp. units) never silently revert.
- `src/components/BottomTabBar.tsx` + `src/components/LogButton.tsx` — fixed
  navigation and log button on every screen.
- `src/store/selectors.ts` → `computeStreak` — streak is a plain count, no guilt.
- `src/store/useStore.ts` → `updateSettings` and `src/lib/db.ts` — settings are
  written through to IndexedDB and merged over defaults on load, so **units never
  revert**. The Settings screen reads the value straight from persisted state,
  which is the proof: what you see is what was saved
  (`src/screens/Settings.tsx`, Units card comment).

---

## The four screens

1. **Today** — live calorie deficit (the visual anchor) with a Recharts progress
   ring, date + streak + units header, always-visible quick-add, today's log with
   confidence badges and an edit sheet, "Same as yesterday?" one-tap copy, and a
   readiness card that taps through to Recovery.
2. **Food** — three equal logging doors (Quick number · Search · Describe/photo),
   a searchable/editable custom-foods list, and the confidence legend. The AI
   describe/photo door returns an **editable draft you confirm** — it never
   auto-saves.
3. **Recovery** — readiness score 0–100 with transparent contributing factors
   (sleep, resting HR, HRV), a Calm/Reactive sensitivity toggle that visibly
   changes the computation, an editable last-night sleep override, a 7-day trend,
   and the invited-only Ask Coach panel.
4. **Settings** — units (kg / st-lb), manual calorie target, per-signal coaching
   toggles, and a reset-data button for demos.

---

## What's stubbed (and what a real version needs)

All stubs live in `src/services/` as typed modules with the same interface a real
service would expose, so the internals can be swapped without touching the UI.
Fake data is clearly labelled in each file.

| Stub | File | Real version needs |
|------|------|--------------------|
| Food database | `foodDatabase.ts` | A real **nutrition API / verified food DB** (e.g. branded + generic UK foods with portions and per-100g macros), barcode lookup, fuzzy search. |
| AI food parser | `aiParser.ts` | A real **LLM** for text ("2 eggs and toast" → structured items with quantities) and a real **vision model** for photos. Keep the draft-confirm step — AI still never auto-commits. |
| Readiness | `readiness.ts` | Real **HRV/sleep/HR data from a wearable API** (Oura/Whoop/Apple Health), an HRV pipeline (RMSSD over the sleep window normalised to a personal baseline), and per-user calibration. |
| Coach | `coach.ts` | A real **LLM call**, still invited-only and signal-gated, ideally grounded in the user's own recent data. |

Other things intentionally **out of scope** for the MVP:

- **Auth + cloud sync** — data is local-only (IndexedDB). A real version needs
  accounts and sync across devices.
- **Native wrapper** — for app-store distribution you'd wrap the PWA (e.g.
  Capacitor) or build native shells.
- **Weight tracking / unit conversion math** — the units setting is honoured and
  persisted, but the MVP doesn't yet log body weight.

---

## Project structure

```
src/
  components/        UI: badges, quick-add, sheets, charts, tab bar, log button
    ui/              shadcn/ui-style primitives (button, input, sheet, switch…)
    food/            Food-screen doors and lists
    recovery/        Recovery-screen trend + coach panel
  screens/           Today, Food, Recovery, Settings
  services/          STUBBED, swappable: foodDatabase, aiParser, readiness, coach
  store/             Zustand store (useStore) + derived selectors
  lib/               db (IndexedDB), date, units, utils
  types.ts           Data models: FoodEntry, CustomFood, DayLog, Settings…
```

Persistence is centralised in `src/lib/db.ts` (the only module that touches
IndexedDB) and driven by `src/store/useStore.ts`, which hydrates on boot and
write-through persists on every mutation.
