import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ProgressPoint } from "@/types";

const tooltipStyle = {
  backgroundColor: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: 10,
  color: "var(--color-popover-foreground)",
  fontSize: 12,
};

/** Theme-aware line chart for longitudinal progress (restrained teal series). */
export function ProgressChart({ data, height = 260 }: { data: ProgressPoint[]; height?: number }) {
  return (
    <div
      role="img"
      aria-label="Line chart of technical and communication scores across sessions"
      style={{ width: "100%", height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="label"
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            stroke="var(--color-border)"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            stroke="var(--color-border)"
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "var(--color-border)" }} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "var(--color-muted-foreground)" }}
            iconType="plainline"
          />
          <Line
            type="monotone"
            dataKey="technicalScore"
            name="Technical"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            dot={{ r: 2.5, fill: "var(--color-chart-1)" }}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="communicationScore"
            name="Communication"
            stroke="var(--color-chart-3)"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 2.5, fill: "var(--color-chart-3)" }}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
