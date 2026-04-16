import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/markets', label: 'Markets' },
  { to: '/trade', label: 'Trade' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/watchlist', label: 'Watchlist' },
  { to: '/news', label: 'News' },
  { to: '/research', label: 'Research' },
  { to: '/settings', label: 'Settings' },
];

export default function DesktopSidebar() {
  return (
    <aside className="safe-pt fixed left-0 top-0 z-40 hidden h-full w-64 border-r border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-[#070b14]/90 lg:block">
      <div className="px-6 py-6 font-display text-xl">
        <span className="text-teal-600 dark:text-neon-mint">Crop</span>
        <span className="text-slate-900 dark:text-white">Bank</span>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-teal-500/10 text-teal-800 shadow-inner dark:bg-white/10 dark:text-neon-mint'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5'
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
