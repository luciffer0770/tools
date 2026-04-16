import { NavLink } from 'react-router-dom';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/markets', label: 'Markets' },
  { to: '/trade', label: 'Trade' },
  { to: '/news', label: 'News' },
  { to: '/profile', label: 'Profile' },
];

export default function DesktopSidebar() {
  return (
    <aside className="safe-pt fixed left-0 top-0 z-40 hidden h-full w-64 border-r border-white/10 bg-[#070b14]/90 backdrop-blur-xl lg:block">
      <div className="px-6 py-6 font-display text-xl">
        <span className="text-neon-mint">Crop</span>
        <span className="text-white">Bank</span>
      </div>
      <nav className="flex flex-col gap-1 px-3">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? 'bg-white/10 text-neon-mint shadow-inner'
                  : 'text-slate-300 hover:bg-white/5'
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
