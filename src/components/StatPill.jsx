// Small labelled stat used in habit cards and the summary bar.
export default function StatPill({ icon: IconCmp, value, label, accent = false }) {
  return (
    <div className="flex items-center gap-1.5">
      {IconCmp && (
        <IconCmp
          size={14}
          className={accent ? 'text-emerald-400' : 'text-zinc-500'}
          strokeWidth={2.2}
        />
      )}
      <span className={accent ? 'font-semibold text-emerald-400' : 'font-semibold text-zinc-200'}>
        {value}
      </span>
      <span className="text-zinc-500">{label}</span>
    </div>
  );
}
