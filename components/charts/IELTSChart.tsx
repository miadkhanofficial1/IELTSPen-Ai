"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface ChartDataConfig {
  type: "bar" | "line" | "pie";
  title?: string;
  xAxisKey?: string;
  series: {
    key: string;
    label: string;
    color?: string;
  }[];
  data: Record<string, any>[];
}

const DEFAULT_COLORS = [
  "#E31837", // IELTS Crimson Red
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#8B5CF6", // Purple
  "#EC4899", // Pink
];

export const IELTSChart: React.FC<{ chartData: ChartDataConfig }> = ({
  chartData,
}) => {
  if (!chartData || !chartData.data || chartData.data.length === 0) {
    return (
      <div className="w-full h-64 rounded-2xl glass-panel flex items-center justify-center text-xs text-muted">
        No chart visualization provided for this task.
      </div>
    );
  }

  const { type, title, xAxisKey = "name", series = [], data } = chartData;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-xl p-3 border border-border/80 shadow-lg text-xs">
          <p className="font-bold text-foreground mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`tooltip-${index}`} className="flex items-center gap-2 text-muted">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: entry.color }}
              />
              <span>{entry.name}:</span>
              <span className="font-semibold text-foreground">
                {entry.value.toLocaleString()}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full rounded-2xl glass-card p-4 sm:p-5 border border-border/80 my-4">
      {title && (
        <h4 className="text-xs sm:text-sm font-bold font-heading text-foreground mb-3 text-center">
          {title}
        </h4>
      )}

      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          {type === "bar" ? (
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                iconType="circle"
              />
              {series.map((s, idx) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          ) : type === "line" ? (
            <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis
                dataKey={xAxisKey}
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                iconType="circle"
              />
              {series.map((s, idx) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={s.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length]}
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          ) : (
            <PieChart>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                iconType="circle"
              />
              <Pie
                data={data}
                dataKey={series[0]?.key || "value"}
                nameKey={xAxisKey}
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={45}
                paddingAngle={3}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                  />
                ))}
              </Pie>
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IELTSChart;
