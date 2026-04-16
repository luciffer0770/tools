import { NavLink } from 'react-router-dom';

const items = [
  { to: '/dashboard', label: 'Home', icon: '⌂' },
  { to: '/markets', label: 'Markets', icon: '◎' },
  { to: '/trade', label: 'Trade', icon: '⇄' },
  { to: '/news', label: 'News', icon: '✦' },
  { to: '/profile', label: 'You', icon: '◉' },
];

export default function BottomNav() {
  return (
    <nav className="safe-pb fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#070b14]/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-lg justify-between px-2 py-2">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `flex min-h-[48px] min-w-[56px] flex-1 flex-col items-center justify-center rounded-xl text-xs transition ${
                isActive
                  ? 'text-neon-mint shadow-glow'
                  : 'text-slate-400 active:scale-95'
              }`
            }
          >
            <span className="text-lg leading-none">{it.icon}</span>
            <span className="mt-1 font-medium">{it.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
