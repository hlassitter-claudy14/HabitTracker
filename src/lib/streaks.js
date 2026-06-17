// Streak engine.
//
// A habit is "complete" on a day when:
//   - binary:        the day's value is truthy
//   - quantitative:  the day's value >= the habit target
//
// Grace days ("shields"): a missed day that carries a shield does NOT break the
// streak — it bridges the gap. To prevent abuse, only ONE shield per ISO week is
// honored; if a user somehow stored more, we keep the earliest in each week.

import { dayKey, fromKey, addDays, isoWeekKey, lastNDays } from './dates.js';

/** Is the habit complete given a single day's entry? */
export function isDayComplete(habit, entry) {
  if (!entry) return false;
  if (habit.type === 'quantitative') {
    return Number(entry.value || 0) >= Number(habit.target || 1);
  }
  return Boolean(entry.value);
}

/** Fractional progress (0..1) for a day — used by the UI for partial fills. */
export function dayProgress(habit, entry) {
  if (!entry) return 0;
  if (habit.type === 'quantitative') {
    const target = Number(habit.target || 1);
    if (target <= 0) return entry.value ? 1 : 0;
    return Math.max(0, Math.min(1, Number(entry.value || 0) / target));
  }
  return entry.value ? 1 : 0;
}

/**
 * Reduce raw logs to the set of completed day keys and the set of *honored*
 * shield day keys (one per ISO week).
 */
function deriveSets(habit, logs) {
  const complete = new Set();
  const shieldByWeek = new Map(); // weekKey -> earliest shielded dayKey

  for (const [key, entry] of Object.entries(logs || {})) {
    if (isDayComplete(habit, entry)) complete.add(key);
    if (entry && entry.shield) {
      const wk = isoWeekKey(fromKey(key));
      const existing = shieldByWeek.get(wk);
      if (!existing || key < existing) shieldByWeek.set(wk, key);
    }
  }
  return { complete, shields: new Set(shieldByWeek.values()) };
}

/**
 * Walk a contiguous descending range of day keys, returning the length of the
 * unbroken run starting at index 0. Completed days add to the run; shielded
 * days bridge gaps without adding; anything else stops the run.
 */
function runLength(keys, complete, shields) {
  let count = 0;
  for (const key of keys) {
    if (complete.has(key)) count += 1;
    else if (shields.has(key)) continue; // bridge — preserve streak
    else break;
  }
  return count;
}

/**
 * Compute current streak, longest streak, total completions and a recent
 * completion rate for a habit.
 */
export function computeStreaks(habit, logs, today = new Date()) {
  const { complete, shields } = deriveSets(habit, logs);
  const todayKey = dayKey(today);

  // --- Current streak -------------------------------------------------------
  // Today is still "in progress": if it isn't done yet (and isn't shielded),
  // start counting from yesterday so an unfinished today doesn't zero things.
  let startOffset = 0;
  if (!complete.has(todayKey) && !shields.has(todayKey)) startOffset = -1;

  const backKeys = [];
  for (let i = startOffset; i > startOffset - 366; i--) {
    backKeys.push(dayKey(addDays(today, i)));
  }
  const current = runLength(backKeys, complete, shields);

  // --- Longest streak -------------------------------------------------------
  const start = habit.createdAt ? fromKey(dayKey(fromKey(habit.createdAt))) : today;
  let longest = 0;
  let running = 0;
  for (let d = new Date(start); dayKey(d) <= todayKey; d = addDays(d, 1)) {
    const key = dayKey(d);
    if (complete.has(key)) {
      running += 1;
      longest = Math.max(longest, running);
    } else if (shields.has(key)) {
      // bridge — keep the run alive without incrementing
    } else {
      running = 0;
    }
  }
  longest = Math.max(longest, current);

  // --- Totals & recent completion rate -------------------------------------
  const total = complete.size;
  const window = lastNDays(30, today);
  const doneInWindow = window.filter((k) => complete.has(k)).length;
  const completionRate = Math.round((doneInWindow / window.length) * 100);

  return { current, longest, total, completionRate, shields };
}

/** How many shields are still available this ISO week (0 or 1). */
export function shieldsAvailableThisWeek(logs, today = new Date()) {
  const wk = isoWeekKey(today);
  for (const [key, entry] of Object.entries(logs || {})) {
    if (entry && entry.shield && isoWeekKey(fromKey(key)) === wk) return 0;
  }
  return 1;
}
