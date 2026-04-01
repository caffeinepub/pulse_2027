import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { type Exercise, saveExercise } from "../lib/storage";

interface Props {
  open: boolean;
  onClose: () => void;
  onAdded: (ex: Exercise) => void;
}

export default function AddExerciseModal({ open, onClose, onAdded }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"time" | "reps" | "weight">("time");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter an exercise name");
      return;
    }
    const id = `${trimmed.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
    const ex: Exercise = { id, name: trimmed, type, createdAt: Date.now() };
    saveExercise(ex);
    onAdded(ex);
    toast.success(`${trimmed} added!`);
    setName("");
    setType("time");
    setError("");
    onClose();
  }

  const typeOptions: { value: "time" | "reps" | "weight"; label: string }[] = [
    { value: "time", label: "⏱ Time-based" },
    { value: "reps", label: "# Rep-based" },
    { value: "weight", label: "⚖️ Weight-Based" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="exercise.add.modal"
        style={{
          background: "rgba(20,23,28,0.97)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 20,
          backdropFilter: "blur(12px)",
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: "#F3F6FF" }}>New Exercise</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <Label style={{ color: "#A9B1BD", fontSize: 13 }}>
              Exercise Name
            </Label>
            <Input
              data-ocid="exercise.add.input"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g. Pull-ups, Burpees..."
              autoFocus
              style={{
                background: "rgba(255,255,255,0.06)",
                border: error
                  ? "1px solid rgba(220,50,50,0.5)"
                  : "1px solid rgba(255,255,255,0.12)",
                color: "#F3F6FF",
                borderRadius: 10,
              }}
            />
            {error && (
              <span
                data-ocid="exercise.add.error_state"
                style={{ color: "#ff6b6b", fontSize: 12 }}
              >
                {error}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label style={{ color: "#A9B1BD", fontSize: 13 }}>Type</Label>
            <div className="flex gap-2">
              {typeOptions.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  data-ocid="exercise.add.type.toggle"
                  onClick={() => setType(t.value)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background:
                      type === t.value
                        ? "rgba(138,184,255,0.15)"
                        : "rgba(255,255,255,0.05)",
                    border:
                      type === t.value
                        ? "1px solid rgba(138,184,255,0.4)"
                        : "1px solid rgba(255,255,255,0.08)",
                    color: type === t.value ? "#8AB8FF" : "#A9B1BD",
                    boxShadow:
                      type === t.value
                        ? "0 0 12px rgba(138,184,255,0.15)"
                        : "none",
                    fontSize: 12,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            data-ocid="exercise.add.submit_button"
            className="accent-btn py-3 font-semibold mt-1"
          >
            Add Exercise
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
