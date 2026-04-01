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

const WEIGHT_PRESETS = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50];
const REP_PRESETS = [5, 10, 15, 20];

function getTodaySessions(exerciseId: string): Session[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getSessionsForExercise(exerciseId).filter(
    (s) => s.loggedAt >= today.getTime(),
  );
}

interface InlineNumberInputProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  unit?: string;
  "data-ocid"?: string;
}

function InlineNumberInput({
  value,
  onChange,
  min = 0,
  unit,
  "data-ocid": ocid,
}: InlineNumberInputProps) {
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  function commit() {
    const parsed = Number.parseFloat(editVal);
    if (!Number.isNaN(parsed) && parsed >= min) {
      onChange(parsed);
    }
    setEditing(false);
    setEditVal("");
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        inputMode="numeric"
        value={editVal}
        onChange={(e) => setEditVal(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setEditing(false);
            setEditVal("");
          }
        }}
        className="bg-transparent outline-none text-center tabular-nums font-bold"
        style={{
          fontSize: 48,
          width: 120,
          color: "#8AB8FF",
          border: "2px solid rgba(138,184,255,0.5)",
          borderRadius: 12,
        }}
      />
    );
  }

  return (
    <button
      type="button"
      data-ocid={ocid}
      onClick={() => {
        setEditVal(String(value));
        setEditing(true);
      }}
      className="tabular-nums font-bold transition-all hover:opacity-80 cursor-pointer"
      style={{ fontSize: 48, color: "#F3F6FF", lineHeight: 1 }}
      title="Tap to type a value"
    >
      {value}
      {unit && (
        <span style={{ fontSize: 18, color: "#A9B1BD", marginLeft: 4 }}>
          {unit}
        </span>
      )}
    </button>
  );
}

interface Props {
  exercise: Exercise;
  onLogged: () => void;
}

export default function WeightUI({ exercise, onLogged }: Props) {
  const [weight, setWeight] = useState(20);
  const [reps, setReps] = useState(0);
  const [todaySets, setTodaySets] = useState<Session[]>(() =>
    getTodaySessions(exercise.id),
  );

  const refreshSets = useCallback(() => {
    setTodaySets(getTodaySessions(exercise.id));
  }, [exercise.id]);

  useEffect(() => {
    refreshSets();
  }, [refreshSets]);

  function handleLog() {
    if (weight <= 0 || reps <= 0) {
      toast.error("Set weight and reps first!");
      return;
    }
    const session: Session = {
      id: crypto.randomUUID(),
      exerciseId: exercise.id,
      value: weight * reps, // total volume
      weight,
      reps,
      loggedAt: Date.now(),
    };
    saveSession(session);
    refreshSets();
    onLogged();
    // Sticky weight: only reset reps
    setReps(0);
    toast.success(`${weight}kg × ${reps} logged!`);
  }

  function handleDeleteSet(id: string) {
    deleteSession(id);
    refreshSets();
    onLogged();
  }

  const canLog = weight > 0 && reps > 0;

  return (
    <div className="glass-card p-6 flex flex-col gap-6">
      {/* Weight + Reps inputs side by side */}
      <div className="grid grid-cols-2 gap-4">
        {/* Weight */}
        <div className="flex flex-col items-center gap-3">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#5A616B" }}
          >
            Weight
          </p>
          <InlineNumberInput
            value={weight}
            onChange={setWeight}
            min={0}
            unit="kg"
            data-ocid="weight.kg.display"
          />
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="weight.kg.decrement_button"
              onClick={() => setWeight((w) => Math.max(0, +(w - 1).toFixed(2)))}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#A9B1BD",
              }}
            >
              <Minus size={16} />
            </button>
            <button
              type="button"
              data-ocid="weight.kg.increment_button"
              onClick={() => setWeight((w) => +(w + 1).toFixed(2))}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                background: "rgba(138,184,255,0.12)",
                border: "1px solid rgba(138,184,255,0.4)",
                color: "#8AB8FF",
              }}
            >
              <Plus size={16} />
            </button>
          </div>
          {/* Weight presets */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {WEIGHT_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                data-ocid="weight.kg.preset.button"
                onClick={() => setWeight(p)}
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background:
                    weight === p
                      ? "rgba(138,184,255,0.2)"
                      : "rgba(255,255,255,0.05)",
                  border:
                    weight === p
                      ? "1px solid rgba(138,184,255,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                  color: weight === p ? "#8AB8FF" : "#A9B1BD",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Reps */}
        <div className="flex flex-col items-center gap-3">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#5A616B" }}
          >
            Reps
          </p>
          <InlineNumberInput
            value={reps}
            onChange={setReps}
            min={0}
            data-ocid="weight.reps.display"
          />
          <div className="flex gap-2">
            <button
              type="button"
              data-ocid="weight.reps.decrement_button"
              onClick={() => setReps((r) => Math.max(0, r - 1))}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#A9B1BD",
              }}
            >
              <Minus size={16} />
            </button>
            <button
              type="button"
              data-ocid="weight.reps.increment_button"
              onClick={() => setReps((r) => r + 1)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                background: "rgba(138,184,255,0.12)",
                border: "1px solid rgba(138,184,255,0.4)",
                color: "#8AB8FF",
              }}
            >
              <Plus size={16} />
            </button>
          </div>
          {/* Rep presets */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {REP_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                data-ocid="weight.reps.preset.button"
                onClick={() => setReps(p)}
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                style={{
                  background:
                    reps === p
                      ? "rgba(138,184,255,0.2)"
                      : "rgba(255,255,255,0.05)",
                  border:
                    reps === p
                      ? "1px solid rgba(138,184,255,0.5)"
                      : "1px solid rgba(255,255,255,0.08)",
                  color: reps === p ? "#8AB8FF" : "#A9B1BD",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Volume preview */}
      {weight > 0 && reps > 0 && (
        <div className="text-center text-sm" style={{ color: "#A9B1BD" }}>
          Volume:{" "}
          <span style={{ color: "#8AB8FF", fontWeight: 600 }}>
            {weight * reps} kg
          </span>
        </div>
      )}

      <button
        type="button"
        data-ocid="weight.log_button"
        onClick={handleLog}
        disabled={!canLog}
        className="accent-btn py-3 font-semibold text-base disabled:opacity-30 disabled:cursor-not-allowed"
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
                data-ocid={`weight.set.item.${i + 1}`}
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
                  {set.weight}kg × {set.reps}
                </span>
                <span
                  className="text-xs tabular-nums"
                  style={{ color: "#5A616B" }}
                >
                  {set.value}kg vol
                </span>
                <button
                  type="button"
                  data-ocid={`weight.set.delete_button.${i + 1}`}
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
