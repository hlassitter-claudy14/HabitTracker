// Date helpers. Everything is keyed on a local "day key" (YYYY-MM-DD) so the
// app is timezone-stable for a single user and trivially serializable for a
// future backend.

/** Format a Date as a local YYYY-MM-DD key. */
export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse a YYYY-MM-DD key back into a local Date (midnight). */
export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Return a new Date offset by `n` days from `date`. */
export function addDays(date, n) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + n);
  return copy;
}

/** Whole-day difference a - b (positive if a is after b). */
export function daysBetween(a, b) {
  const ms = fromKey(dayKey(a)) - fromKey(dayKey(b));
  return Math.round(ms / 86400000);
}

/**
 * Return an array of day keys for the last `count` days, oldest first,
 * ending on `end` (default today).
 */
export function lastNDays(count, end = new Date()) {
  const keys = [];
  for (let i = count - 1; i >= 0; i--) {
    keys.push(dayKey(addDays(end, -i)));
  }
  return keys;
}

/**
 * ISO-8601 week identifier (e.g. "2026-W25"). Used to enforce the
 * "one shield per week" grace-day rule.
 */
export function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Thursday in current week decides the year.
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((d - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7
    );
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/** Monday-based start of the week containing `date`. */
export function startOfWeek(date) {
  const dayNum = (date.getDay() + 6) % 7; // 0 = Monday
  return addDays(date, -dayNum);
}

/** Day keys Mon..Sun for the week containing `date`. */
export function weekDays(date = new Date()) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => dayKey(addDays(start, i)));
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function weekdayLabel(date) {
  return WEEKDAY_LABELS[(date.getDay() + 6) % 7];
}

export function shortLabel(key) {
  const d = fromKey(key);
  return `${MONTH_LABELS[d.getMonth()]} ${d.getDate()}`;
}

export function isSameDay(a, b) {
  return dayKey(a) === dayKey(b);
}
