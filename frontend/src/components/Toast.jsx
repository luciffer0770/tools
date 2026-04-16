import { useGameStore } from '../store/gameStore.js';

export default function Toast() {
  const toast = useGameStore((s) => s.toast);
  if (!toast) return null;
  const border =
    toast.variant === 'success'
      ? 'border-teal-500/40 bg-teal-500/10'
      : toast.variant === 'error'
        ? 'border-red-500/40 bg-red-500/10'
        : 'border-slate-300 bg-white dark:border-white/15 dark:bg-white/10';
  return (
    <div
      className={`toast-in fixed bottom-24 left-4 right-4 z-[60] mx-auto max-w-md rounded-xl border px-4 py-3 text-sm shadow-lg dark:text-slate-100 ${border} lg:bottom-8`}
      role="status"
    >
      {toast.message}
    </div>
  );
}
