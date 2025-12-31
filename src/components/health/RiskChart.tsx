import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts";

interface RiskChartProps {
  factors: { name: string; value: number; maxValue: number }[];
}

export const RiskChart = ({ factors }: RiskChartProps) => {
  const data = factors.map((f) => ({
    name: f.name,
    value: Math.round((f.value / f.maxValue) * 100),
    fill:
      f.value / f.maxValue < 0.3
        ? "hsl(var(--teal))"
        : f.value / f.maxValue < 0.6
        ? "hsl(var(--accent))"
        : "hsl(var(--destructive))",
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--foreground))" }}
            formatter={(value: number) => [`${value}%`, "Risk Level"]}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
