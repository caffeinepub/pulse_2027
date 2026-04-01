import { getSessions } from "./storage";

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function isWeekday(ts: number): boolean {
  const day = new Date(ts).getDay(); // 0=Sun, 6=Sat
  return day >= 1 && day <= 5;
}

function prevWeekday(ts: number): number {
  let d = new Date(ts);
  d.setDate(d.getDate() - 1);
  while (!isWeekday(d.getTime())) {
    d.setDate(d.getDate() - 1);
  }
  return startOfDay(d.getTime());
}

/**
 * Returns the current streak count.
 * Only weekdays count. Weekends are bridged over.
 * 1 grace day allowed: one missed weekday doesn't break the streak.
 */
export function computeStreak(): number {
  const sessions = getSessions();
  if (sessions.length === 0) return 0;

  // Get unique active weekdays (days with at least 1 session)
  const activeDaySet = new Set<number>();
  for (const s of sessions) {
    const day = startOfDay(s.loggedAt);
    if (isWeekday(day)) {
      activeDaySet.add(day);
    }
  }

  if (activeDaySet.size === 0) return 0;

  const today = startOfDay(Date.now());
  const activeDays = Array.from(activeDaySet).sort((a, b) => b - a); // desc

  const mostRecent = activeDays[0];
  const prevWD = prevWeekday(today);
  const prevPrevWD = prevWeekday(prevWD);

  const todayActive = activeDaySet.has(today);
  const prevActive = activeDaySet.has(prevWD);
  const prevPrevActive = activeDaySet.has(prevPrevWD);

  if (!todayActive && !prevActive && !prevPrevActive) return 0;

  let streak = 0;
  let current = today;
  let gracePeriodUsed = false;

  if (!todayActive && !isWeekday(today)) {
    current = prevWD;
  }

  let safetyLimit = 500;
  while (safetyLimit-- > 0) {
    const dayTs = startOfDay(current);
    if (!isWeekday(dayTs)) {
      current = prevWeekday(current);
      continue;
    }
    if (activeDaySet.has(dayTs)) {
      streak++;
      current = prevWeekday(current);
      gracePeriodUsed = false;
    } else {
      if (!gracePeriodUsed) {
        gracePeriodUsed = true;
        const before = prevWeekday(current);
        if (!activeDaySet.has(before)) break;
        current = before;
      } else {
        break;
      }
    }
    if (
      mostRecent === dayTs &&
      streak > 0 &&
      !activeDaySet.has(prevWeekday(dayTs))
    )
      break;
    if (dayTs < mostRecent - 90 * 86400 * 1000) break;
  }

  return streak;
}

export interface DayActivity {
  date: Date;
  active: boolean;
  isWeekend: boolean;
}

/**
 * Returns Mon–Sun of the current week with activity info.
 */
export function getLast7Days(): DayActivity[] {
  const sessions = getSessions();
  const activeDaySet = new Set<number>();
  for (const s of sessions) {
    activeDaySet.add(startOfDay(s.loggedAt));
  }

  // Find Monday of the current week
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
  // Distance from Monday: if Sunday (0), go back 6 days; else go back (dayOfWeek - 1)
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - daysFromMonday);

  const result: DayActivity[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    d.setHours(0, 0, 0, 0);
    const ts = d.getTime();
    result.push({
      date: d,
      active: activeDaySet.has(ts),
      isWeekend: !isWeekday(ts),
    });
  }
  return result;
}
