import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import Card from '../components/Card.jsx';

export default function Dashboard() {
  const user = useGameStore((s) => s.user);
  const crops = useGameStore((s) => s.crops);
  const holdings = useGameStore((s) => s.portfolio.holdings);

  const equity = useMemo(() => {
    const pos = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
    return pos;
  }, [holdings]);

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
      <Card className="lg:col-span-1">
        <p className="text-xs uppercase tracking-widest text-slate-500">Balance</p>
        <p className="mt-2 font-display text-3xl text-neon-mint">${user?.balance.toFixed(2)}</p>
        <p className="mt-2 text-sm text-slate-400">Open positions ≈ ${equity.toFixed(2)}</p>
      </Card>
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-500">Portfolio</p>
          <Link to="/profile" className="text-xs text-neon-mint">
            History →
          </Link>
        </div>
        {holdings.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No open lots yet. Visit Trade to open your first position.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {holdings.map((h) => (
              <li
                key={h.cropId}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm"
              >
                <span>{h.name}</span>
                <span className="text-slate-300">
                  {h.quantity} @ ${h.currentPrice.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="lg:col-span-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-500">Crop overview</p>
          <Link to="/markets" className="text-xs text-neon-mint">
            All markets →
          </Link>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {crops.slice(0, 4).map((c) => (
            <div key={c.id} className="rounded-xl border border-white/5 bg-white/5 p-3">
              <p className="text-sm font-medium text-white">{c.name}</p>
              <p className="mt-1 text-lg text-neon-mint">${c.currentPrice.toFixed(2)}</p>
              <p className="text-xs text-slate-500">Demand {c.demandIndex.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
