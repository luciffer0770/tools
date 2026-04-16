export default function EmptyState({ title, hint, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 px-6 py-12 text-center dark:border-white/10 dark:bg-white/5">
      <p className="font-medium text-slate-800 dark:text-white">{title}</p>
      {hint && <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{hint}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
