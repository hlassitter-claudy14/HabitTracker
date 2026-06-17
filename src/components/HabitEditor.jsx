// Modal for creating or editing a habit: name, icon, type (binary vs
// quantitative) and — for quantitative — a numeric goal and unit.

import { useEffect, useState } from 'react';
import { X, Check, Hash, ToggleLeft } from 'lucide-react';
import Icon, { ICON_CHOICES } from './Icon.jsx';

const BLANK = { name: '', icon: 'Target', type: 'binary', target: 1, unit: '' };

export default function HabitEditor({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState(BLANK);

  useEffect(() => {
    if (open) setForm(initial ? { ...BLANK, ...initial } : BLANK);
  }, [open, initial]);

  if (!open) return null;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const isEdit = Boolean(initial?.id);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({
      ...form,
      name: form.name.trim(),
      target: form.type === 'quantitative' ? Math.max(1, Number(form.target) || 1) : 1,
      unit: form.type === 'quantitative' ? form.unit.trim() : '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-up" onClick={onClose} />

      {/* Sheet / dialog */}
      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md animate-pop-in rounded-t-3xl border border-midnight-border bg-midnight-card p-5 ring-hairline sm:rounded-3xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">{isEdit ? 'Edit habit' : 'New habit'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Name */}
        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Name</label>
        <input
          autoFocus
          value={form.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="e.g. GTO Study"
          className="mb-4 w-full rounded-xl border border-midnight-border bg-midnight-bg px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
        />

        {/* Type */}
        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Type</label>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <TypeOption
            active={form.type === 'binary'}
            onClick={() => set({ type: 'binary' })}
            icon={ToggleLeft}
            title="Binary"
            subtitle="Done / not done"
          />
          <TypeOption
            active={form.type === 'quantitative'}
            onClick={() => set({ type: 'quantitative' })}
            icon={Hash}
            title="Quantitative"
            subtitle="Count toward a goal"
          />
        </div>

        {/* Goal + unit (quantitative only) */}
        {form.type === 'quantitative' && (
          <div className="mb-4 grid grid-cols-2 gap-2 animate-fade-up">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Daily goal</label>
              <input
                type="number"
                min="1"
                value={form.target}
                onChange={(e) => set({ target: e.target.value })}
                className="w-full rounded-xl border border-midnight-border bg-midnight-bg px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-400">Unit</label>
              <input
                value={form.unit}
                onChange={(e) => set({ unit: e.target.value })}
                placeholder="mins, miles…"
                className="w-full rounded-xl border border-midnight-border bg-midnight-bg px-3.5 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>
        )}

        {/* Icon picker */}
        <label className="mb-1.5 block text-xs font-medium text-zinc-400">Icon</label>
        <div className="mb-6 grid grid-cols-9 gap-1.5">
          {ICON_CHOICES.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => set({ icon: name })}
              className={[
                'grid aspect-square place-items-center rounded-lg transition',
                form.icon === name
                  ? 'bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-500/40'
                  : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200',
              ].join(' ')}
              aria-label={name}
            >
              <Icon name={name} size={18} strokeWidth={2.2} />
            </button>
          ))}
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 active:scale-[0.99]"
        >
          <Check size={18} strokeWidth={2.6} />
          {isEdit ? 'Save changes' : 'Create habit'}
        </button>
      </form>
    </div>
  );
}

function TypeOption({ active, onClick, icon: IconCmp, title, subtitle }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition',
        active
          ? 'border-emerald-500/40 bg-emerald-500/10'
          : 'border-midnight-border bg-midnight-bg hover:border-zinc-700',
      ].join(' ')}
    >
      <IconCmp size={18} className={active ? 'text-emerald-400' : 'text-zinc-400'} />
      <span className={`text-sm font-medium ${active ? 'text-emerald-300' : 'text-zinc-200'}`}>{title}</span>
      <span className="text-[11px] text-zinc-500">{subtitle}</span>
    </button>
  );
}
