export default function PageLoader() {
  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent dark:border-neon-mint" />
      <p className="text-sm">Loading…</p>
    </div>
  );
}
