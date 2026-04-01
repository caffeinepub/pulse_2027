import { format } from "date-fns";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  type Exercise,
  type Session,
  getExercises,
  getSessionsInRange,
} from "../lib/storage";

type Timeframe = "week" | "month" | "quarter" | "year";

const TIMEFRAMES: { label: string; key: Timeframe; days: number }[] = [
  { label: "Weekly", key: "week", days: 7 },
  { label: "Monthly", key: "month", days: 30 },
  { label: "Quarterly", key: "quarter", days: 90 },
  { label: "Yearly", key: "year", days: 365 },
];

function formatValue(value: number, type: "time" | "reps" | "weight"): string {
  if (type === "time") {
    const m = Math.floor(value / 60);
    const s = value % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return String(Math.round(value));
}

/** Returns the Monday of the current week (Mon = start of week) */
function getWeekMonday(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

interface ChartDatum {
  date: string;
  best: number | null;
  avg: number | null;
  total: number | null;
}

interface WeightChartDatum {
  date: string;
  maxWeight: number | null;
  totalVolume: number | null;
  avgReps: number | null;
}

const tooltipStyle = {
  background: "rgba(25,28,34,0.95)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "10px",
  color: "#F3F6FF",
  fontSize: "13px",
  padding: "8px 12px",
};

function getDayLabel(dayStart: Date, tfKey: Timeframe): string {
  if (tfKey === "week") return format(dayStart, "EEE");
  if (tfKey === "month") return format(dayStart, "MMM d");
  if (tfKey === "quarter") return format(dayStart, "MMM d");
  return format(dayStart, "MMM");
}

/** Bar chart — used for weekly data */
function BarChartCard({
  title,
  dataKey,
  data,
  exerciseType,
  unit,
}: {
  title: string;
  dataKey: string;
  data: (ChartDatum | WeightChartDatum)[];
  exerciseType: "time" | "reps" | "weight";
  unit?: string;
}) {
  const hasData = data.some(
    (d) => (d as unknown as Record<string, unknown>)[dataKey] !== null,
  );
  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold mb-3" style={{ color: "#A9B1BD" }}>
        {title}
      </h3>
      {hasData ? (
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#5A616B", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#5A616B", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatValue(v as number, exerciseType)}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [
                `${formatValue(Number(value), exerciseType)}${unit ? ` ${unit}` : ""}`,
                title,
              ]}
              labelStyle={{ color: "#A9B1BD", marginBottom: 4 }}
              cursor={{ fill: "rgba(138,184,255,0.05)" }}
            />
            <Bar
              dataKey={dataKey}
              fill="#8AB8FF"
              fillOpacity={0.75}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div
          className="flex items-center justify-center h-40 rounded-xl"
          style={{ background: "rgba(255,255,255,0.03)" }}
          data-ocid="analytics.chart.empty_state"
        >
          <span style={{ color: "#5A616B", fontSize: 13 }}>
            No data in this range
          </span>
        </div>
      )}
    </div>
  );
}

/** Line chart — used for monthly / quarterly / yearly data */
function LineChartCard({
  title,
  dataKey,
  data,
  exerciseType,
  unit,
}: {
  title: string;
  dataKey: string;
  data: (ChartDatum | WeightChartDatum)[];
  exerciseType: "time" | "reps" | "weight";
  unit?: string;
}) {
  const hasData = data.some(
    (d) => (d as unknown as Record<string, unknown>)[dataKey] !== null,
  );
  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold mb-3" style={{ color: "#A9B1BD" }}>
        {title}
      </h3>
      {hasData ? (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 4, left: -28, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#5A616B", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#5A616B", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatValue(v as number, exerciseType)}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [
                `${formatValue(Number(value), exerciseType)}${unit ? ` ${unit}` : ""}`,
                title,
              ]}
              labelStyle={{ color: "#A9B1BD", marginBottom: 4 }}
              cursor={{ stroke: "rgba(138,184,255,0.3)", strokeWidth: 1 }}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke="#8AB8FF"
              strokeWidth={3}
              dot={{ r: 4, fill: "#8AB8FF", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#8AB8FF", strokeWidth: 0 }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div
          className="flex items-center justify-center h-40 rounded-xl"
          style={{ background: "rgba(255,255,255,0.03)" }}
          data-ocid="analytics.chart.empty_state"
        >
          <span style={{ color: "#5A616B", fontSize: 13 }}>
            No data in this range
          </span>
        </div>
      )}
    </div>
  );
}

function ChartCard(props: {
  title: string;
  dataKey: string;
  data: (ChartDatum | WeightChartDatum)[];
  exerciseType: "time" | "reps" | "weight";
  unit?: string;
  timeframe: Timeframe;
}) {
  if (props.timeframe === "week") {
    return <BarChartCard {...props} />;
  }
  return <LineChartCard {...props} />;
}

function formatTableValue(
  s: Session,
  exerciseType: "time" | "reps" | "weight",
): string {
  if (exerciseType === "weight" && s.weight != null && s.reps != null) {
    return `${s.weight}kg × ${s.reps}`;
  }
  return formatValue(s.value, exerciseType);
}

export default function AnalyticsPage() {
  const exercises = getExercises();
  const [selectedId, setSelectedId] = useState<string>(
    exercises[0]?.id ?? "plank",
  );
  const [timeframe, setTimeframe] = useState<Timeframe>("week");

  const selectedExercise: Exercise | undefined = exercises.find(
    (e) => e.id === selectedId,
  );
  const tfDays = TIMEFRAMES.find((t) => t.key === timeframe)!.days;

  const sessions = useMemo(() => {
    if (!selectedExercise) return [];
    const now = Date.now();
    // For weekly view, start from Monday of current week
    let fromTs: number;
    if (timeframe === "week") {
      fromTs = getWeekMonday().getTime();
    } else {
      fromTs = now - tfDays * 86400 * 1000;
    }
    return getSessionsInRange(selectedExercise.id, fromTs, now);
  }, [selectedExercise, tfDays, timeframe]);

  /** Build per-day buckets for the chart */
  const dayBuckets = useMemo(() => {
    const buckets: { dayStart: Date; label: string }[] = [];
    if (timeframe === "week") {
      const monday = getWeekMonday();
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        buckets.push({ dayStart: d, label: getDayLabel(d, timeframe) });
      }
    } else if (timeframe === "year") {
      // Group by month — 12 months back
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        d.setHours(0, 0, 0, 0);
        buckets.push({ dayStart: d, label: format(d, "MMM") });
      }
    } else {
      const now = Date.now();
      for (let i = tfDays - 1; i >= 0; i--) {
        const dayStart = new Date(now - i * 86400 * 1000);
        dayStart.setHours(0, 0, 0, 0);
        buckets.push({ dayStart, label: getDayLabel(dayStart, timeframe) });
      }
    }
    return buckets;
  }, [timeframe, tfDays]);

  const chartData = useMemo((): ChartDatum[] => {
    return dayBuckets.map(({ dayStart, label }) => {
      let dayEnd: Date;
      if (timeframe === "year") {
        // end of month
        dayEnd = new Date(dayStart.getFullYear(), dayStart.getMonth() + 1, 0);
        dayEnd.setHours(23, 59, 59, 999);
      } else {
        dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
      }
      const daySessions = sessions.filter(
        (s) =>
          s.loggedAt >= dayStart.getTime() && s.loggedAt <= dayEnd.getTime(),
      );
      if (daySessions.length === 0) {
        return { date: label, best: null, avg: null, total: null };
      }
      const values = daySessions.map((s) => s.value);
      return {
        date: label,
        best: Math.max(...values),
        avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
        total: values.reduce((a, b) => a + b, 0),
      };
    });
  }, [sessions, dayBuckets, timeframe]);

  const weightChartData = useMemo((): WeightChartDatum[] => {
    return dayBuckets.map(({ dayStart, label }) => {
      let dayEnd: Date;
      if (timeframe === "year") {
        dayEnd = new Date(dayStart.getFullYear(), dayStart.getMonth() + 1, 0);
        dayEnd.setHours(23, 59, 59, 999);
      } else {
        dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
      }
      const daySessions = sessions.filter(
        (s) =>
          s.loggedAt >= dayStart.getTime() && s.loggedAt <= dayEnd.getTime(),
      );
      if (daySessions.length === 0) {
        return {
          date: label,
          maxWeight: null,
          totalVolume: null,
          avgReps: null,
        };
      }
      const weights = daySessions.map((s) => s.weight ?? 0);
      const repsList = daySessions.map((s) => s.reps ?? 0);
      return {
        date: label,
        maxWeight: Math.max(...weights),
        totalVolume: daySessions.reduce((a, s) => a + s.value, 0),
        avgReps: Math.round(
          repsList.reduce((a, b) => a + b, 0) / repsList.length,
        ),
      };
    });
  }, [sessions, dayBuckets, timeframe]);

  const tableData = [...sessions].sort((a, b) => b.loggedAt - a.loggedAt);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div className="flex gap-2 flex-wrap">
        {exercises.map((ex) => (
          <button
            key={ex.id}
            type="button"
            data-ocid="analytics.exercise.tab"
            onClick={() => setSelectedId(ex.id)}
            className={`pill-tab${ex.id === selectedId ? " active" : ""}`}
            style={{
              border:
                ex.id === selectedId
                  ? "1px solid rgba(138,184,255,0.3)"
                  : "1px solid rgba(255,255,255,0.08)",
              borderRadius: "9999px",
            }}
          >
            {ex.name}
          </button>
        ))}
      </div>

      <div
        className="flex items-center gap-1 p-1 rounded-full self-start"
        style={{
          background: "rgba(35,40,48,0.7)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        {TIMEFRAMES.map((t) => (
          <button
            key={t.key}
            type="button"
            data-ocid="analytics.timeframe.tab"
            onClick={() => setTimeframe(t.key)}
            className={`pill-tab${t.key === timeframe ? " active" : ""}`}
            style={{ padding: "0.25rem 0.875rem" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {selectedExercise ? (
        <>
          {selectedExercise.type === "weight" ? (
            <>
              <ChartCard
                title="Max Weight"
                dataKey="best"
                data={chartData}
                exerciseType="weight"
                unit="kg"
                timeframe={timeframe}
              />
              <ChartCard
                title="Daily Volume (kg)"
                dataKey="totalVolume"
                data={weightChartData}
                exerciseType="weight"
                unit="kg"
                timeframe={timeframe}
              />
              <ChartCard
                title="Average Reps"
                dataKey="avgReps"
                data={weightChartData}
                exerciseType="reps"
                unit="reps"
                timeframe={timeframe}
              />
            </>
          ) : (
            <>
              <ChartCard
                title="Best Performance"
                dataKey="best"
                data={chartData}
                exerciseType={selectedExercise.type}
                timeframe={timeframe}
              />
              <ChartCard
                title="Average Performance"
                dataKey="avg"
                data={chartData}
                exerciseType={selectedExercise.type}
                timeframe={timeframe}
              />
              <ChartCard
                title="Total Volume"
                dataKey="total"
                data={chartData}
                exerciseType={selectedExercise.type}
                timeframe={timeframe}
              />
            </>
          )}

          <div className="glass-card p-4">
            <h3
              className="text-sm font-semibold mb-3"
              style={{ color: "#A9B1BD" }}
            >
              Raw Data
            </h3>
            {tableData.length === 0 ? (
              <div
                className="text-center py-8"
                style={{ color: "#5A616B", fontSize: 13 }}
                data-ocid="analytics.table.empty_state"
              >
                No sessions logged yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-ocid="analytics.table">
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {["Date", "Time", "Value"].map((h) => (
                        <th
                          key={h}
                          className="pb-2 text-left font-medium"
                          style={{
                            color: "#5A616B",
                            fontSize: 11,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.map((s, i) => (
                      <tr
                        key={s.id}
                        data-ocid={`analytics.table.row.${i + 1}`}
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <td className="py-2" style={{ color: "#A9B1BD" }}>
                          {format(new Date(s.loggedAt), "MMM d, yyyy")}
                        </td>
                        <td className="py-2" style={{ color: "#A9B1BD" }}>
                          {format(new Date(s.loggedAt), "h:mm a")}
                        </td>
                        <td
                          className="py-2 font-medium"
                          style={{ color: "#F3F6FF" }}
                        >
                          {formatTableValue(s, selectedExercise.type)}
                          {selectedExercise.type === "reps" && (
                            <span
                              className="ml-1 text-xs"
                              style={{ color: "#5A616B" }}
                            >
                              reps
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div
          className="glass-card p-8 text-center"
          style={{ color: "#5A616B" }}
          data-ocid="analytics.empty_state"
        >
          No exercises found. Add one in the Tracker tab.
        </div>
      )}
    </div>
  );
}
