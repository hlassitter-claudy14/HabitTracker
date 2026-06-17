import { useMemo, useState } from 'react';
import { Plus, Flame, Target, Sparkles, Trash2 } from 'lucide-react';
import { useStore } from './hooks/useStore.js';
import { dayKey } from './lib/dates.js';
import { computeStreaks, isDayComplete } from './lib/streaks.js';
import ViewToggle from './components/ViewToggle.jsx';
import HabitCard from './components/HabitCard.jsx';
import WeeklyView from './components/WeeklyView.jsx';
import HabitEditor from './components/HabitEditor.jsx';

export default function App() {
  const { state, store } = useStore();
  const [editor, setEditor] = useState({ open: false, initial: null });
  const [pendingDelete, setPendingDelete] = useState(null);

  const today = useMemo(() => new Date(), []);
  const todayKey = dayKey(today);

  const habits = useMemo(() => state?.habits ?? [], [state]);
  const logsByHabit = useMemo(() => state?.logs ?? {}, [state]);
  const view = state?.settings?.view ?? 'today';

  // --- Today's summary ------------------------------------------------------
  const summary = useMemo(() => {
    let doneToday = 0;
    let bestStreak = 0;
    let activeStreaks = 0;
    for (const h of habits) {
      const logs = logsByHabit[h.id] || {};
      if (isDayComplete(h, logs[todayKey])) doneToday += 1;
      const s = computeStreaks(h, logs, today);
      bestStreak = Math.max(bestStreak, s.current);
      if (s.current > 0) activeStreaks += 1;
    }
    const pct = habits.length ? Math.round((doneToday / habits.length) * 100) : 0;
    return { doneToday, total: habits.length, pct, bestStreak, activeStreaks };
  }, [habits, logsByHabit, today, todayKey]);

  // --- Handlers -------------------------------------------------------------
  const onLog = (habitId, day, entry) => store.setEntry(habitId, day, entry);

  const onSave = async (form) => {
    if (form.id) await store.updateHabit(form.id, form);
    else await store.createHabit(form);
    setEditor({ open: false, initial: null });
  };

  const confirmDelete = async () => {
    if (pendingDelete) await store.deleteHabit(pendingDelete.id);
    setPendingDelete(null);
  };

  if (!state) {
    return (
      <div className="grid min-h-screen place-items-center text-zinc-600">
        <Sparkles className="animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-2xl px-4 pb-28 pt-6 sm:pt-10">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-500/80">
                {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="mt-0.5 text-2xl font-bold tracking-tight text-zinc-50">Habits</h1>
            </div>
            <ViewToggle view={view} onChange={(v) => store.setView(v)} />
          </div>

          {/* Summary bar */}
          {habits.length > 0 && (
            <div className="mt-5 grid grid-cols-3 gap-3">
              <SummaryCard
                icon={Target}
                value={`${summary.doneToday}/${summary.total}`}
                label="Done today"
                progress={summary.pct}
              />
              <SummaryCard icon={Flame} value={summary.bestStreak} label="Top streak" accent />
              <SummaryCard icon={Sparkles} value={summary.activeStreaks} label="Active streaks" />
            </div>
          )}
        </header>

        {/* Content */}
        {habits.length === 0 ? (
          <EmptyState onAdd={() => setEditor({ open: true, initial: null })} />
        ) : view === 'today' ? (
          <div className="grid grid-cols-1 gap-4">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                logs={logsByHabit[habit.id] || {}}
                today={today}
                onLog={onLog}
                onEdit={(h) => setEditor({ open: true, initial: h })}
                onDelete={(h) => setPendingDelete(h)}
              />
            ))}
          </div>
        ) : (
          <WeeklyView habits={habits} logsByHabit={logsByHabit} today={today} onLog={onLog} />
        )}
      </div>

      {/* Floating add button */}
      {habits.length > 0 && (
        <button
          onClick={() => setEditor({ open: true, initial: null })}
          className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-95"
          style={{ bottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        >
          <Plus size={18} strokeWidth={2.6} />
          New habit
        </button>
      )}

      {/* Editor */}
      <HabitEditor
        open={editor.open}
        initial={editor.initial}
        onClose={() => setEditor({ open: false, initial: null })}
        onSave={onSave}
      />

      {/* Delete confirmation */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPendingDelete(null)} />
          <div className="relative z-10 w-full max-w-sm animate-pop-in rounded-2xl border border-midnight-border bg-midnight-card p-5 ring-hairline">
            <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-red-500/10 text-red-400">
              <Trash2 size={20} />
            </div>
            <h3 className="text-base font-semibold text-zinc-100">Delete “{pendingDelete.name}”?</h3>
            <p className="mt-1 text-sm text-zinc-500">
              This permanently removes the habit and all of its history.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-400"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: IconCmp, value, label, progress, accent }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-midnight-border bg-midnight-card p-3.5 ring-hairline">
      <IconCmp size={16} className={accent ? 'text-emerald-400' : 'text-zinc-500'} strokeWidth={2.2} />
      <div className="mt-2 text-xl font-bold tracking-tight text-zinc-50">{value}</div>
      <div className="text-[11px] text-zinc-500">{label}</div>
      {typeof progress === 'number' && (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-midnight-border bg-midnight-card/50 px-6 py-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400">
        <Sparkles size={26} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-zinc-100">Start your first habit</h2>
      <p className="mt-1 max-w-xs text-sm text-zinc-500">
        Track anything — from a daily read to 15 minutes of GTO study. Build streaks, stay consistent.
      </p>
      <button
        onClick={onAdd}
        className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 active:scale-95"
      >
        <Plus size={18} strokeWidth={2.6} />
        New habit
      </button>
    </div>
  );
}
