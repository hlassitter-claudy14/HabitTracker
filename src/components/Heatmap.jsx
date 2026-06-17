// GitHub-style contribution heatmap for the last 30 days.
// Columns are weeks (Mon→Sun rows). Cell intensity reflects completion:
// binary habits are on/off; quantitative habits fade in with progress.

import { useMemo } from 'react';
import { dayKey, fromKey, addDays, startOfWeek, shortLabel } from '../lib/dates.js';
import { dayProgress } from '../lib/streaks.js';

const LEVEL_CLASS = [
  'bg-midnight-muted/40', // 0 — empty
  'bg-emerald-500/25',
  'bg-emerald-500/50',
  'bg-emerald-500/75',
  'bg-emerald-500', // 4 — fully complete
];

function levelFor(progress) {
  if (progress <= 0) return 0;
  if (progress >= 1) return 4;
  if (progress >= 0.66) return 3;
  if (progress >= 0.33) return 2;
  return 1;
}

const WEEKDAY_ROWS = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];

export default function Heatmap({ habit, logs, days = 30, today = new Date() }) {
  const columns = useMemo(() => {
    const firstDay = addDays(today, -(days - 1));
    let cursor = startOfWeek(firstDay); // Monday on/before the window start
    const todayKey = dayKey(today);
    const firstKey = dayKey(firstDay);

    const cols = [];
    // Build week columns until we've passed today.
    while (dayKey(cursor) <= todayKey) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const d = addDays(cursor, i);
        const key = dayKey(d);
        const inWindow = key >= firstKey && key <= todayKey;
        const entry = logs[key];
        week.push({
          key,
          inWindow,
          isFuture: key > todayKey,
          isToday: key === todayKey,
          progress: inWindow ? dayProgress(habit, entry) : 0,
          shield: Boolean(entry?.shield),
        });
      }
      cols.push(week);
      cursor = addDays(cursor, 7);
    }
    return cols;
  }, [habit, logs, days, today]);

  // Month labels above columns (show when the month changes).
  const monthLabels = columns.map((week, ci) => {
    const firstInWindow = week.find((c) => c.inWindow) || week[0];
    const d = fromKey(firstInWindow.key);
    const label = d.toLocaleString('en-US', { month: 'short' });
    const prev = ci > 0 ? fromKey((columns[ci - 1].find((c) => c.inWindow) || columns[ci - 1][0]).key) : null;
    return !prev || prev.getMonth() !== d.getMonth() ? label : '';
  });

  return (
    <div className="flex gap-2">
      {/* Weekday rail */}
      <div className="flex flex-col gap-1 pt-5">
        {WEEKDAY_ROWS.map((label, i) => (
          <div key={i} className="h-3 text-[10px] leading-3 text-zinc-600">
            {label}
          </div>
        ))}
      </div>

      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="mb-1 flex gap-1">
          {monthLabels.map((label, i) => (
            <div key={i} className="w-3 text-[10px] text-zinc-600">
              {label}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1">
          {columns.map((week, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {week.map((cell) => {
                if (cell.isFuture || !cell.inWindow) {
                  return <div key={cell.key} className="h-3 w-3 rounded-[3px] bg-transparent" />;
                }
                const level = levelFor(cell.progress);
                return (
                  <div
                    key={cell.key}
                    title={`${shortLabel(cell.key)} — ${
                      cell.shield ? 'Shielded' : Math.round(cell.progress * 100) + '%'
                    }`}
                    className={[
                      'h-3 w-3 rounded-[3px] transition-colors duration-200',
                      LEVEL_CLASS[level],
                      cell.isToday ? 'ring-1 ring-inset ring-emerald-300/70' : '',
                      cell.shield ? 'ring-1 ring-inset ring-sky-400/80' : '',
                    ].join(' ')}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeatmapLegend() {
  return (
    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
      <span>Less</span>
      {LEVEL_CLASS.map((cls, i) => (
        <span key={i} className={`h-3 w-3 rounded-[3px] ${cls}`} />
      ))}
      <span>More</span>
    </div>
  );
}
