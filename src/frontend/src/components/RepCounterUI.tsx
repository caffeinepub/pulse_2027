import { Minus, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  type Exercise,
  type Session,
  deleteSession,
  getSessionsForExercise,
  saveSession,
} from "../lib/storage";

const REP_PRESETS = [5, 10, 15, 20];

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

export default function RepCounterUI({ exercise, onLogged }: Props) {
  const [count, setCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [todaySets, setTodaySets] = useState<Session[]>(() =>
    getTodaySessions(exercise.id),
  );

  const refreshSets = useCallback(() => {
    setTodaySets(getTodaySessions(exercise.id));
  }, [exercise.id]);

  useEffect(() => {
    refreshSets();
  }, [refreshSets]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function commitEdit() {
    const parsed = Number.parseInt(editVal, 10);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      setCount(parsed);
    }
    setEditing(false);
    setEditVal("");
  }

  function handleLog() {
    if (count <= 0) {
      toast.error("Add some reps first!");
      return;
    }
    const session: Session = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      value: count,
      loggedAt: Date.now(),
    };
    saveSession(session);
    refreshSets();
    onLogged();
    setCount(0);
    toast.success(`${count} reps logged!`);
  }

  function handleDeleteSet(id: string) {
    deleteSession(id);
    refreshSets();
    onLogged();
  }

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-5">
      {/* Quick presets */}
      <div className="flex gap-2">
        {REP_PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            data-ocid="reps.preset.button"
            onClick={() => setCount(p)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background:
                count === p
                  ? "rgba(138,184,255,0.2)"
                  : "rgba(255,255,255,0.06)",
              border:
                count === p
                  ? "1px solid rgba(138,184,255,0.5)"
                  : "1px solid rgba(255,255,255,0.1)",
              color: count === p ? "#8AB8FF" : "#A9B1BD",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Tappable count display */}
      {editing ? (
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") {
              setEditing(false);
              setEditVal("");
            }
          }}
          className="hero-reps text-center bg-transparent outline-none"
          style={{
            width: 140,
            border: "2px solid rgba(138,184,255,0.5)",
            borderRadius: 16,
            color: "#8AB8FF",
          }}
        />
      ) : (
        <button
          type="button"
          data-ocid="reps.display"
          onClick={() => {
            setEditVal(String(count));
            setEditing(true);
          }}
          className="hero-reps cursor-pointer transition-all hover:opacity-80"
          title="Tap to type a value"
        >
          {count}
        </button>
      )}

      <div className="flex items-center gap-4">
        <button
          type="button"
          data-ocid="reps.decrement_button"
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#A9B1BD",
          }}
        >
          <Minus size={22} />
        </button>

        <button
          type="button"
          data-ocid="reps.increment_button"
          onClick={() => setCount((c) => c + 1)}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
          style={{
            background: "rgba(138,184,255,0.12)",
            border: "1px solid rgba(138,184,255,0.4)",
            color: "#8AB8FF",
            boxShadow: "0 0 20px rgba(138,184,255,0.2)",
          }}
        >
          <Plus size={26} />
        </button>
      </div>

      <button
        type="button"
        data-ocid="reps.log_button"
        onClick={handleLog}
        disabled={count === 0}
        className="accent-btn px-10 py-3 font-semibold text-base disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Log Set
      </button>

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
                data-ocid={`reps.set.item.${i + 1}`}
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
                  {set.value} reps
                </span>
                <button
                  type="button"
                  data-ocid={`reps.set.delete_button.${i + 1}`}
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
