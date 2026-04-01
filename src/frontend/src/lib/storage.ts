export interface Exercise {
  id: string;
  name: string;
  type: "time" | "reps" | "weight";
  createdAt: number;
}

export interface Session {
  id: string;
  exerciseId: string;
  value: number; // seconds for time-based, count for rep-based, weight*reps for weight-based
  loggedAt: number; // unix timestamp
  weight?: number; // kg (weight exercises only)
  reps?: number; // rep count (weight exercises only)
}

const EXERCISES_KEY = "pulse_exercises";
const SESSIONS_KEY = "pulse_sessions";

const DEFAULT_EXERCISES: Exercise[] = [
  { id: "plank", name: "Plank", type: "time", createdAt: 0 },
  { id: "pushups", name: "Push-ups", type: "reps", createdAt: 0 },
  { id: "squats", name: "Squats", type: "reps", createdAt: 0 },
];

export function getExercises(): Exercise[] {
  try {
    const raw = localStorage.getItem(EXERCISES_KEY);
    if (!raw) {
      saveExercises(DEFAULT_EXERCISES);
      return DEFAULT_EXERCISES;
    }
    const parsed = JSON.parse(raw) as Exercise[];
    return parsed.length > 0 ? parsed : DEFAULT_EXERCISES;
  } catch {
    return DEFAULT_EXERCISES;
  }
}

function saveExercises(exercises: Exercise[]): void {
  localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
}

export function saveExercise(exercise: Exercise): void {
  const exercises = getExercises();
  const idx = exercises.findIndex((e) => e.id === exercise.id);
  if (idx >= 0) {
    exercises[idx] = exercise;
  } else {
    exercises.push(exercise);
  }
  saveExercises(exercises);
}

export function deleteExercise(id: string): void {
  const exercises = getExercises().filter((e) => e.id !== id);
  saveExercises(exercises);
  const sessions = getSessions().filter((s) => s.exerciseId !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getSessions(): Session[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Session[];
  } catch {
    return [];
  }
}

export function saveSession(session: Session): void {
  const sessions = getSessions();
  sessions.push(session);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function getSessionsForExercise(exerciseId: string): Session[] {
  return getSessions().filter((s) => s.exerciseId === exerciseId);
}

export function getSessionsInRange(
  exerciseId: string,
  fromTs: number,
  toTs: number,
): Session[] {
  return getSessionsForExercise(exerciseId).filter(
    (s) => s.loggedAt >= fromTs && s.loggedAt <= toTs,
  );
}
