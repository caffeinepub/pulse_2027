import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { type Exercise, deleteExercise } from "../lib/storage";

interface Props {
  exercises: Exercise[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: () => void;
}

export default function ExerciseSelector({
  exercises,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
}: Props) {
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);

  function handleDelete() {
    if (!deleteTarget) return;
    deleteExercise(deleteTarget.id);
    onDelete();
    toast.success(`${deleteTarget.name} deleted`);
    setDeleteTarget(null);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {exercises.map((ex) => (
        <div key={ex.id} className="flex items-center gap-1 group">
          <button
            type="button"
            data-ocid="exercise.tab"
            onClick={() => onSelect(ex.id)}
            className={`pill-tab flex items-center gap-1.5${ex.id === selectedId ? " active" : ""}`}
            style={{
              border:
                ex.id === selectedId
                  ? "1px solid rgba(138,184,255,0.3)"
                  : "1px solid rgba(255,255,255,0.08)",
              borderRadius: "9999px",
              paddingRight: ex.id === selectedId ? "6px" : undefined,
            }}
          >
            {ex.name}
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background: "rgba(90,97,107,0.5)",
                color: "#A9B1BD",
                fontSize: 10,
              }}
            >
              {ex.type === "time" ? "⏱" : "#"}
            </span>
          </button>
          {ex.id === selectedId && exercises.length > 1 && (
            <button
              type="button"
              data-ocid="exercise.delete_button"
              onClick={() => setDeleteTarget(ex)}
              className="p-1 rounded-full transition-all hover:bg-red-500/10"
              style={{ color: "#5A616B" }}
              title={`Delete ${ex.name}`}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        data-ocid="exercise.add_button"
        onClick={onAdd}
        className="accent-btn flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium"
      >
        <Plus size={14} />
        Add
      </button>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent
          style={{
            background: "rgba(20,23,28,0.97)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16,
            backdropFilter: "blur(12px)",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "#F3F6FF" }}>
              Delete {deleteTarget?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: "#A9B1BD" }}>
              This will permanently delete this exercise and all its logged
              sessions. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="exercise.delete.cancel_button"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#F3F6FF",
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="exercise.delete.confirm_button"
              onClick={handleDelete}
              style={{
                background: "rgba(220,50,50,0.15)",
                border: "1px solid rgba(220,50,50,0.4)",
                color: "#ff6b6b",
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
