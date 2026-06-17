// Weekly bird's-eye grid: every habit as a row, Mon→Sun as columns.
// Click a cell to toggle a binary habit, or step a quantitative one toward goal.

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Flame, ShieldCheck } from 'lucide-react';
import Icon from './Icon.jsx';
import { dayKey, addDays, startOfWeek, weekdayLabel } from '../lib/dates.js';
import { computeStreaks, isDayComplete, dayProgress } from '../lib/streaks.js';

export default function WeeklyView({ habits, logsByHabit, today, onLog }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const { weekKeys, weekDates, label, isCurrentWeek } = useMemo(() => {
    const base = addDays(startOfWeek(today), weekOffset * 7);
    const dates = Array.from({ length: 7 }, (_, i) => addDays(base, i));
    const keys = dates.map(dayKey);
    const start = dates[0];
    const end = dates[6];
    const fmt = (d) => d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
    return {
      weekKeys: keys,
      weekDates: dates,
      label: `${fmt(start)} – ${fmt(end)}`,
      isCurrentWeek: weekOffset === 0,
    };
  }, [today, weekOffset]);

  const todayKey = dayKey(today);

  const cycleCell = (habit, key, entry) => {
    if (key > todayKey) return; // no logging the future
    if (habit.type === 'binary') {
      onLog(habit.id, key, isDayComplete(habit, entry) ? null : { value: true, shield: entry?.shield });
    } else {
      // Step through: empty -> full goal -> clear.
      onLog(
        habit.id,
        key,
        isDayComplete(habit, entry) ? null : { value: habit.target, shield: entry?.shield }
      );
    }
  };

  return (
    <div className="animate-fade-up rounded-2xl border border-midnight-border bg-midnight-card p-4 ring-hairline sm:p-5">
      {/* Week nav */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-200">
          {isCurrentWeek ? 'This week' : 'Week of'}{' '}
          <span className="font-normal text-zinc-500">{label}</span>
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWeekOffset((v) => v - 1)}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200"
            aria-label="Previous week"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            disabled={isCurrentWeek}
            className="rounded-lg px-2 py-1 text-xs text-zinc-400 transition hover:bg-white/5 disabled:opacity-40"
          >
            Today
          </button>
          <button
            onClick={() => setWeekOffset((v) => Math.min(0, v + 1))}
            disabled={isCurrentWeek}
            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200 disabled:opacity-40"
            aria-label="Next week"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-1">
          <thead>
            <tr>
              <th className="w-40 min-w-[9rem] text-left text-xs font-medium text-zinc-500" />
              {weekDates.map((d) => {
                const isToday = dayKey(d) === todayKey;
                return (
                  <th key={dayKey(d)} className="px-1 pb-2 text-center">
                    <div className={`text-[10px] font-medium ${isToday ? 'text-emerald-400' : 'text-zinc-500'}`}>
                      {weekdayLabel(d)}
                    </div>
                    <div className={`text-xs ${isToday ? 'font-semibold text-zinc-100' : 'text-zinc-400'}`}>
                      {d.getDate()}
                    </div>
                  </th>
                );
              })}
              <th className="px-1 pb-2 text-center text-[10px] font-medium text-zinc-500">
                <Flame size={13} className="mx-auto" />
              </th>
            </tr>
          </thead>
          <tbody>
            {habits.map((habit) => {
              const logs = logsByHabit[habit.id] || {};
              const stats = computeStreaks(habit, logs, today);
              return (
                <tr key={habit.id}>
                  {/* Habit name */}
                  <td className="pr-3">
                    <div className="flex items-center gap-2">
                      <Icon name={habit.icon} size={16} className="shrink-0 text-zinc-400" strokeWidth={2.2} />
                      <span className="truncate text-sm text-zinc-200">{habit.name}</span>
                    </div>
                  </td>

                  {/* Day cells */}
                  {weekKeys.map((key) => {
                    const entry = logs[key];
                    const progress = dayProgress(habit, entry);
                    const complete = isDayComplete(habit, entry);
                    const shielded = Boolean(entry?.shield);
                    const future = key > todayKey;
                    return (
                      <td key={key} className="px-1 text-center">
                        <button
                          onClick={() => cycleCell(habit, key, entry)}
                          disabled={future}
                          title={shielded ? 'Shielded (grace day)' : `${Math.round(progress * 100)}%`}
                          className={[
                            'mx-auto grid h-9 w-9 place-items-center rounded-lg text-xs font-semibold transition-all duration-200',
                            future ? 'cursor-default opacity-30' : 'active:scale-90',
                            complete
                              ? 'bg-emerald-500 text-emerald-950 hover:bg-emerald-400'
                              : progress > 0
                              ? 'bg-emerald-500/30 text-emerald-300 hover:bg-emerald-500/40'
                              : 'bg-white/5 text-transparent hover:bg-white/10',
                            shielded ? 'ring-1 ring-inset ring-sky-400/80' : '',
                          ].join(' ')}
                        >
                          {complete ? '✓' : shielded ? <ShieldCheck size={14} className="text-sky-400" /> : '·'}
                        </button>
                      </td>
                    );
                  })}

                  {/* Current streak */}
                  <td className="px-1 text-center">
                    <span
                      className={`text-sm font-semibold ${
                        stats.current > 0 ? 'text-emerald-400' : 'text-zinc-600'
                      }`}
                    >
                      {stats.current}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
