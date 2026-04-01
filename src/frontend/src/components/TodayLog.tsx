import { Trash2 } from "lucide-react";
import {
  type Exercise,
  type Session,
  deleteSession,
  getSessionsForExercise,
} from "../lib/storage";

function formatValue(value: number, type: "time" | "reps" | "weight"): string {
  if (type === "time") {
    const m = Math.floor(value / 60);
    const s = value % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  if (type === "weight") {
    return `${value} kg vol`;
  }
  return `${value} reps`;
}

function formatSessionValue(
  s: Session,
  type: "time" | "reps" | "weight",
): string {
  if (type === "weight" && s.weight != null && s.reps != null) {
    return `${s.weight}kg × ${s.reps}`;
  }
  return formatValue(s.value, type);
}

interface Props {
  exercise: Exercise;
  refreshKey: number;
}

export default function TodayLog({ exercise, refreshKey: _refreshKey }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sessions: Session[] = getSessionsForExercise(exercise.id)
    .filter((s) => s.loggedAt >= today.getTime())
    .sort((a, b) => b.loggedAt - a.loggedAt);

  if (sessions.length === 0) {
    return (
      <div
        className="glass-card p-4 text-center"
        style={{ color: "#5A616B", fontSize: 14 }}
        data-ocid="today_log.empty_state"
      >
        No sets logged today. Start your first set!
      </div>
    );
  }

  const values = sessions.map((s) => s.value);
  const best = Math.max(...values);
  const total = values.reduce((a, b) => a + b, 0);

  return (
    <div
      className="glass-card p-4 flex flex-col gap-3"
      data-ocid="today_log.panel"
    >
      <div className="flex items-center justify-between">
        <h3
          className="text-sm font-semibold"
          style={{
            color: "#A9B1BD",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontSize: 11,
          }}
        >
          Today's Log
        </h3>
        <div className="flex gap-3 text-xs" style={{ color: "#5A616B" }}>
          <span>
            Best:{" "}
            <span style={{ color: "#8AB8FF" }}>
              {formatValue(best, exercise.type)}
            </span>
          </span>
          <span>
            Total:{" "}
            <span style={{ color: "#8AB8FF" }}>
              {formatValue(total, exercise.type)}
            </span>
          </span>
        </div>
      </div>

      {sessions.map((s, i) => (
        <div
          key={s.id}
          data-ocid={`today_log.item.${i + 1}`}
          className="flex items-center justify-between py-1.5"
          style={{
            borderBottom:
              i < sessions.length - 1
                ? "1px solid rgba(255,255,255,0.05)"
                : "none",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: "rgba(138,184,255,0.1)", color: "#8AB8FF" }}
            >
              {sessions.length - i}
            </span>
            <span
              className="text-sm font-medium tabular-nums"
              style={{ color: "#F3F6FF" }}
            >
              {formatSessionValue(s, exercise.type)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: "#5A616B" }}>
              {new Date(s.loggedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <button
              type="button"
              data-ocid={`today_log.delete_button.${i + 1}`}
              onClick={() => {
                deleteSession(s.id);
                window.dispatchEvent(new CustomEvent("pulse-session-deleted"));
              }}
              className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
              style={{ color: "#5A616B" }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
