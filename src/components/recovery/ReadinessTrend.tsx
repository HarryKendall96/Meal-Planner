import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface Point {
  label: string;
  score: number;
}

/** 7-day readiness trend (Recharts line). */
export function ReadinessTrend({ data }: { data: Point[] }) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid hsl(214 32% 91%)",
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="hsl(160 84% 39%)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "hsl(160 84% 39%)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
