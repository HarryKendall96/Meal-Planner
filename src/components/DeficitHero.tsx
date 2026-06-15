import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

interface Props {
  caloriesIn: number;
  caloriesOut: number;
  target: number;
}

/**
 * The single most important number: today's live calorie deficit/surplus.
 * Large and central — the visual anchor of the whole app.
 * The Recharts ring shows progress of calories-in toward the target.
 */
export function DeficitHero({ caloriesIn, caloriesOut, target }: Props) {
  const deficit = caloriesOut - caloriesIn;
  const isDeficit = deficit >= 0;

  const pct = target > 0 ? Math.min(caloriesIn / target, 1) : 0;
  // Ring colour: green while under target, amber as you approach, red if over.
  const over = caloriesIn > target;
  const ringColor = over
    ? "hsl(0 84% 60%)"
    : pct > 0.85
      ? "hsl(38 92% 50%)"
      : "hsl(160 84% 39%)";

  const ringData = [{ name: "in", value: caloriesIn }];

  return (
    <div className="rounded-2xl bg-card p-5 shadow-sm">
      <div className="relative mx-auto h-[200px] w-[200px]">
        <RadialBarChart
          width={200}
          height={200}
          cx="50%"
          cy="50%"
          innerRadius="74%"
          outerRadius="100%"
          barSize={16}
          data={ringData}
          startAngle={90}
          endAngle={-270}
        >
          {/* Map the value onto a 0..target angular scale. */}
          <PolarAngleAxis
            type="number"
            domain={[0, Math.max(target, caloriesIn, 1)]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: "hsl(214 32% 91%)" }}
            dataKey="value"
            cornerRadius={10}
            angleAxisId={0}
            fill={ringColor}
          />
        </RadialBarChart>

        {/* Centre overlay: the deficit number. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {isDeficit ? "Deficit" : "Surplus"}
          </span>
          <span
            className="text-4xl font-extrabold tabular-nums"
            style={{ color: isDeficit ? "hsl(160 84% 33%)" : "hsl(0 84% 55%)" }}
          >
            {isDeficit ? "" : "+"}
            {Math.abs(deficit).toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">kcal</span>
        </div>
      </div>

      {/* In / Out breakdown */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-muted/60 py-2">
          <div className="text-xs text-muted-foreground">In</div>
          <div className="text-lg font-bold tabular-nums">
            {caloriesIn.toLocaleString()}
          </div>
        </div>
        <div className="rounded-xl bg-muted/60 py-2">
          <div className="text-xs text-muted-foreground">Out (target)</div>
          <div className="text-lg font-bold tabular-nums">
            {caloriesOut.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
