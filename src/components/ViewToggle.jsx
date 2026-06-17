// Segmented control to switch between the focused Today list and the Weekly grid.
import { CalendarCheck, CalendarRange } from 'lucide-react';

const OPTIONS = [
  { id: 'today', label: 'Today', icon: CalendarCheck },
  { id: 'weekly', label: 'Weekly', icon: CalendarRange },
];

export default function ViewToggle({ view, onChange }) {
  return (
    <div className="relative inline-flex rounded-xl border border-midnight-border bg-midnight-card p-1 ring-hairline">
      {OPTIONS.map(({ id, label, icon: IconCmp }) => {
        const active = view === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={[
              'relative z-10 flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-200',
              active ? 'text-emerald-950' : 'text-zinc-400 hover:text-zinc-200',
            ].join(' ')}
          >
            {active && (
              <span className="absolute inset-0 -z-10 rounded-lg bg-emerald-500 transition-all duration-200" />
            )}
            <IconCmp size={15} strokeWidth={2.4} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
