import { useCallback, useState } from "react";
import AddExerciseModal from "../components/AddExerciseModal";
import ExerciseSelector from "../components/ExerciseSelector";
import RepCounterUI from "../components/RepCounterUI";
import StreakWidget from "../components/StreakWidget";
import TimerUI from "../components/TimerUI";
import TodayLog from "../components/TodayLog";
import WeightUI from "../components/WeightUI";
import { type Exercise, getExercises } from "../lib/storage";

export default function TrackerPage() {
  const [exercises, setExercises] = useState<Exercise[]>(() => getExercises());
  const [selectedId, setSelectedId] = useState<string>(
    () => getExercises()[0]?.id ?? "plank",
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [logRefresh, setLogRefresh] = useState(0);

  const selectedExercise =
    exercises.find((e) => e.id === selectedId) ?? exercises[0];

  const refresh = useCallback(() => {
    const updated = getExercises();
    setExercises(updated);
    if (!updated.find((e) => e.id === selectedId) && updated.length > 0) {
      setSelectedId(updated[0].id);
    }
  }, [selectedId]);

  const handleSessionLogged = useCallback(() => {
    setLogRefresh((n) => n + 1);
  }, []);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <StreakWidget />

      <ExerciseSelector
        exercises={exercises}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onAdd={() => setShowAddModal(true)}
        onDelete={refresh}
      />

      {selectedExercise && (
        <div key={selectedExercise.id}>
          {selectedExercise.type === "time" ? (
            <TimerUI
              exercise={selectedExercise}
              onLogged={handleSessionLogged}
            />
          ) : selectedExercise.type === "weight" ? (
            <WeightUI
              exercise={selectedExercise}
              onLogged={handleSessionLogged}
            />
          ) : (
            <RepCounterUI
              exercise={selectedExercise}
              onLogged={handleSessionLogged}
            />
          )}
        </div>
      )}

      {selectedExercise && (
        <TodayLog exercise={selectedExercise} refreshKey={logRefresh} />
      )}

      <AddExerciseModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdded={(ex) => {
          refresh();
          setSelectedId(ex.id);
        }}
      />
    </div>
  );
}
