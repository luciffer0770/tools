import { useEffect, useRef, useState } from 'react';

export default function CropSelect({ crops, value, onChange, label = 'Crop' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function onDoc(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const current = crops.find((c) => c.id === value) || crops[0];

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1 sm:max-w-xs">
      <span className="sr-only">{label}</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex min-h-[48px] w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-left text-sm font-medium text-slate-900 shadow-sm ring-teal-500/30 transition hover:border-teal-500/40 focus:outline-none focus:ring-2 dark:border-white/15 dark:bg-slate-900/80 dark:text-white dark:hover:border-neon-mint/30"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">{current?.name ?? 'Select crop'}</span>
        <span className={`shrink-0 text-slate-500 transition ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-white/15 dark:bg-slate-900"
        >
          {crops.map((c) => (
            <li key={c.id} role="option" aria-selected={c.id === value}>
              <button
                type="button"
                className={`flex w-full items-center px-3 py-3 text-left text-sm ${
                  c.id === value
                    ? 'bg-teal-500/15 font-semibold text-teal-900 dark:bg-neon-mint/15 dark:text-neon-mint'
                    : 'text-slate-800 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10'
                }`}
                onClick={() => {
                  onChange(c.id);
                  setOpen(false);
                }}
              >
                <span className="truncate">{c.name}</span>
                <span className="ml-auto shrink-0 pl-2 text-xs text-slate-500 dark:text-slate-400">
                  ${c.currentPrice?.toFixed(2)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
