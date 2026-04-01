import { computeStreak, getLast7Days } from "../lib/streak";

// Mon-first labels: M T W T F S S
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export default function StreakWidget() {
  const streak = computeStreak();
  const days = getLast7Days();

  return (
    <div
      className="glass-card p-4 flex items-center justify-between"
      data-ocid="streak.panel"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
          style={{
            background: "rgba(138,184,255,0.1)",
            border: "1px solid rgba(138,184,255,0.2)",
          }}
        >
          🔥
        </div>
        <div>
          <div className="flex items-baseline gap-1">
            <span
              className="text-3xl font-bold tabular-nums"
              style={{ color: streak > 0 ? "#F3F6FF" : "#5A616B" }}
            >
              {streak}
            </span>
            <span className="text-sm" style={{ color: "#A9B1BD" }}>
              day streak
            </span>
          </div>
          <p className="text-xs" style={{ color: "#5A616B" }}>
            {streak === 0 ? "Start your streak today!" : "Keep it going 💪"}
          </p>
        </div>
      </div>

      <div className="flex items-end gap-1.5">
        {days.map((d, i) => (
          <div
            key={d.date.toISOString()}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="w-6 h-6 rounded-lg transition-all"
              style={{
                background: d.active
                  ? "rgba(138,184,255,0.6)"
                  : d.isWeekend
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.08)",
                boxShadow: d.active ? "0 0 8px rgba(138,184,255,0.4)" : "none",
                border: d.active
                  ? "1px solid rgba(138,184,255,0.5)"
                  : "1px solid rgba(255,255,255,0.06)",
              }}
            />
            <span
              style={{
                fontSize: 9,
                color: d.isWeekend ? "#3A3F47" : "#5A616B",
              }}
            >
              {DAY_LABELS[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
