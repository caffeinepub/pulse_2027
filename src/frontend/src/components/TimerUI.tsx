import { Play, RotateCcw, Square, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type Exercise,
  type Session,
  deleteSession,
  getSessionsForExercise,
  saveSession,
} from "../lib/storage";

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  const cs = Math.floor((ms % 1000) / 10); // centiseconds
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function formatTimeShort(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getTodaySessions(exerciseId: string): Session[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getSessionsForExercise(exerciseId).filter(
    (s) => s.loggedAt >= today.getTime(),
  );
}

interface Props {
  exercise: Exercise;
  onLogged: () => void;
}

export default function TimerUI({ exercise, onLogged }: Props) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const [todaySets, setTodaySets] = useState<Session[]>(() =>
    getTodaySessions(exercise.id),
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);
  const baseRef = useRef<number>(0);

  const refreshSets = useCallback(() => {
    setTodaySets(getTodaySessions(exercise.id));
  }, [exercise.id]);

  useEffect(() => {
    refreshSets();
  }, [refreshSets]);

  useEffect(() => {
    if (running) {
      startRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setElapsedMs(baseRef.current + (Date.now() - startRef.current));
      }, 10);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function handleStart() {
    baseRef.current = elapsedMs;
    setRunning(true);
  }

  function handleStop() {
    setRunning(false);
    if (elapsedMs > 0) {
      const session: Session = {
        id: crypto.randomUUID(),
        exerciseId: exercise.id,
        value: Math.round(elapsedMs / 1000), // store in seconds
        loggedAt: Date.now(),
      };
      saveSession(session);
      refreshSets();
      onLogged();
      baseRef.current = 0;
      setElapsedMs(0);
    }
  }

  function handleReset() {
    setRunning(false);
    baseRef.current = 0;
    setElapsedMs(0);
  }

  function handleDeleteSet(id: string) {
    deleteSession(id);
    refreshSets();
    onLogged();
  }

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-6">
      <div className="hero-timer" data-ocid="timer.display">
        {formatTime(elapsedMs)}
      </div>

      <div className="flex items-center gap-3">
        {!running ? (
          <button
            type="button"
            data-ocid="timer.start_button"
            onClick={handleStart}
            className="accent-btn flex items-center gap-2 px-8 py-3 text-base font-semibold"
          >
            <Play size={18} fill="currentColor" />
            Start
          </button>
        ) : (
          <button
            type="button"
            data-ocid="timer.stop_button"
            onClick={handleStop}
            className="flex items-center gap-2 px-8 py-3 text-base font-semibold rounded-full transition-all"
            style={{
              background: "rgba(138,184,255,0.2)",
              border: "1px solid rgba(138,184,255,0.5)",
              color: "#F3F6FF",
              boxShadow: "0 0 24px rgba(138,184,255,0.3)",
            }}
          >
            <Square size={18} fill="currentColor" />
            Stop & Log
          </button>
        )}
        <button
          type="button"
          data-ocid="timer.reset_button"
          onClick={handleReset}
          className="p-3 rounded-full transition-all"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#5A616B",
          }}
          title="Reset"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {running && (
        <div
          className="w-2 h-2 rounded-full animate-pulse_glow"
          style={{ background: "#8AB8FF", boxShadow: "0 0 8px #8AB8FF" }}
        />
      )}

      {todaySets.length > 0 && (
        <div className="w-full">
          <p
            className="text-xs font-medium mb-2"
            style={{
              color: "#5A616B",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Today's Sets
          </p>
          <AnimatePresence>
            {todaySets.map((set, i) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                data-ocid={`timer.set.item.${i + 1}`}
                className="flex items-center justify-between py-2"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <span className="text-sm" style={{ color: "#A9B1BD" }}>
                  Set {i + 1}
                </span>
                <span
                  className="font-medium tabular-nums"
                  style={{ color: "#F3F6FF" }}
                >
                  {formatTimeShort(set.value)}
                </span>
                <button
                  type="button"
                  data-ocid={`timer.set.delete_button.${i + 1}`}
                  onClick={() => handleDeleteSet(set.id)}
                  className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                  style={{ color: "#5A616B" }}
                >
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
