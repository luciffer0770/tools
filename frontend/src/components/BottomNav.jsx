import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', label: 'Home', short: '⌂' },
  { to: '/markets', label: 'Market', short: '◎' },
  { to: '/trade', label: 'Trade', short: '⇄' },
  { to: '/portfolio', label: 'Book', short: '▤' },
  { to: '/watchlist', label: 'Watch', short: '★' },
  { to: '/news', label: 'News', short: '✦' },
  { to: '/research', label: 'Lab', short: '⌬' },
  { to: '/settings', label: 'More', short: '⚙' },
];

export default function BottomNav() {
  return (
    <nav className="safe-pb fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#070b14]/95">
      <div className="mx-auto flex max-w-2xl gap-1 overflow-x-auto px-1 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `flex min-h-[48px] min-w-[64px] shrink-0 flex-col items-center justify-center rounded-xl px-1 text-[10px] font-semibold uppercase tracking-wide transition sm:min-w-[72px] sm:text-[11px] ${
                isActive
                  ? 'text-teal-600 dark:text-neon-mint'
                  : 'text-slate-500 active:scale-95 dark:text-slate-400'
              }`
            }
          >
            <span className="text-base leading-none sm:text-lg">{it.short}</span>
            <span className="mt-1 max-w-[4.5rem] truncate">{it.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
