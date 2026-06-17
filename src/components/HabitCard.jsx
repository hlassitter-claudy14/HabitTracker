// Focused "Today" card for a single habit: progress control, smart-streak
// stats, a grace-day shield, and the 30-day heatmap.

import { useMemo, useState } from 'react';
import {
  Flame, Trophy, Percent, Shield, ShieldCheck, Check, Minus, Plus,
  MoreVertical, Pencil, Trash2,
} from 'lucide-react';
import Icon from './Icon.jsx';
import StatPill from './StatPill.jsx';
import Heatmap, { HeatmapLegend } from './Heatmap.jsx';
import { dayKey } from '../lib/dates.js';
import { computeStreaks, isDayComplete, dayProgress, shieldsAvailableThisWeek } from '../lib/streaks.js';

export default function HabitCard({ habit, logs, today, onLog, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const todayKey = dayKey(today);
  const entry = logs[todayKey];

  const stats = useMemo(() => computeStreaks(habit, logs, today), [habit, logs, today]);
  const complete = isDayComplete(habit, entry);
  const progress = dayProgress(habit, entry);
  const shieldUsedToday = Boolean(entry?.shield);
  const canShield = shieldUsedToday || shieldsAvailableThisWeek(logs, today) > 0;

  // --- Mutations ------------------------------------------------------------
  const toggleBinary = () => {
    onLog(habit.id, todayKey, complete ? null : { value: true, shield: shieldUsedToday });
  };

  const bump = (delta) => {
    const next = Math.max(0, Number(entry?.value || 0) + delta);
    onLog(habit.id, todayKey, next === 0 && !shieldUsedToday ? null : { value: next, shield: shieldUsedToday });
  };

  const completeTarget = () => {
    onLog(habit.id, todayKey, { value: habit.target, shield: shieldUsedToday });
  };

  const toggleShield = () => {
    if (!canShield) return;
    const value = entry?.value ?? (habit.type === 'quantitative' ? 0 : false);
    onLog(habit.id, todayKey, { value, shield: !shieldUsedToday });
  };

  return (
    <div className="group relative animate-fade-up rounded-2xl border border-midnight-border bg-midnight-card p-5 ring-hairline transition-colors duration-300 hover:border-zinc-700">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={[
              'grid h-11 w-11 place-items-center rounded-xl transition-colors duration-300',
              complete ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-zinc-400',
            ].join(' ')}
          >
            <Icon name={habit.icon} size={20} strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="font-semibold leading-tight text-zinc-100">{habit.name}</h3>
            <p className="text-xs text-zinc-500">
              {habit.type === 'quantitative'
                ? `Goal: ${habit.target}${habit.unit ? ' ' + habit.unit : ''} / day`
                : 'Daily'}
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-1.5 text-zinc-500 opacity-0 transition hover:bg-white/5 hover:text-zinc-300 focus:opacity-100 group-hover:opacity-100"
            aria-label="Habit options"
          >
            <MoreVertical size={18} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-36 animate-pop-in overflow-hidden rounded-xl border border-midnight-border bg-midnight-card shadow-xl ring-hairline">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(habit); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5"
                >
                  <Pencil size={15} /> Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(habit); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Progress control */}
      <div className="mt-4">
        {habit.type === 'binary' ? (
          <button
            onClick={toggleBinary}
            className={[
              'flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98]',
              complete
                ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/30'
                : 'bg-white/5 text-zinc-300 hover:bg-white/10',
            ].join(' ')}
          >
            <Check size={18} strokeWidth={2.6} />
            {complete ? 'Completed' : 'Mark done'}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => bump(-1)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-zinc-300 transition hover:bg-white/10 active:scale-95"
                aria-label="Decrease"
              >
                <Minus size={18} />
              </button>

              <div className="flex flex-1 flex-col items-center">
                <div className="font-mono text-lg font-semibold text-zinc-100">
                  <span className={complete ? 'text-emerald-400' : ''}>{Number(entry?.value || 0)}</span>
                  <span className="text-zinc-600"> / {habit.target}</span>
                  {habit.unit && <span className="ml-1 text-xs text-zinc-500">{habit.unit}</span>}
                </div>
                {/* Progress bar */}
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, progress * 100)}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => bump(1)}
                className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-zinc-300 transition hover:bg-white/10 active:scale-95"
                aria-label="Increase"
              >
                <Plus size={18} />
              </button>
            </div>
            {!complete && (
              <button
                onClick={completeTarget}
                className="w-full rounded-lg py-1.5 text-xs font-medium text-emerald-400/90 transition hover:bg-emerald-500/10"
              >
                Log full goal
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <StatPill icon={Flame} value={stats.current} label="current" accent={stats.current > 0} />
        <StatPill icon={Trophy} value={stats.longest} label="best" />
        <StatPill icon={Percent} value={`${stats.completionRate}%`} label="30d" />

        {/* Grace-day shield */}
        <button
          onClick={toggleShield}
          disabled={!canShield}
          title={
            shieldUsedToday
              ? 'Grace day active — protects your streak today'
              : canShield
              ? 'Use a grace day (1 per week) to protect your streak'
              : 'Weekly grace day already used'
          }
          className={[
            'ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition',
            shieldUsedToday
              ? 'bg-sky-500/15 text-sky-400 ring-1 ring-inset ring-sky-500/30'
              : canShield
              ? 'text-zinc-400 hover:bg-white/5 hover:text-sky-400'
              : 'cursor-not-allowed text-zinc-700',
          ].join(' ')}
        >
          {shieldUsedToday ? <ShieldCheck size={14} /> : <Shield size={14} />}
          {shieldUsedToday ? 'Shielded' : 'Shield'}
        </button>
      </div>

      {/* Heatmap */}
      <div className="mt-5 border-t border-midnight-border pt-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-500">Last 30 days</span>
          <HeatmapLegend />
        </div>
        <Heatmap habit={habit} logs={logs} today={today} />
      </div>
    </div>
  );
}
