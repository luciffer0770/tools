import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function Dashboard() {
  const user = useGameStore((s) => s.user);
  const crops = useGameStore((s) => s.crops);
  const holdings = useGameStore((s) => s.portfolio.holdings);
  const portfolio = useGameStore((s) => s.portfolio);

  const equity = useMemo(() => {
    return holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  }, [holdings]);

  return (
    <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-4 lg:space-y-0">
      <Card className="lg:col-span-1">
        <p className="text-xs uppercase tracking-widest text-slate-500">Cash</p>
        <p className="mt-2 font-display text-3xl text-teal-600 dark:text-neon-mint">${user?.balance.toFixed(2)}</p>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Positions mark ≈ ${equity.toFixed(2)} · Unrealized {portfolio.unrealizedPl >= 0 ? '+' : ''}
          ${portfolio.unrealizedPl?.toFixed(2) ?? '0.00'}
        </p>
      </Card>
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-500">Open lots</p>
          <Link to="/portfolio" className="text-xs font-medium text-teal-600 dark:text-neon-mint">
            Full portfolio →
          </Link>
        </div>
        {holdings.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No positions yet"
              hint="Jump to Trade and place a small buy to seed your book."
              action={
                <Link
                  to="/trade"
                  className="inline-flex min-h-[44px] items-center rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white dark:bg-neon-mint dark:text-slate-900"
                >
                  Open trade
                </Link>
              }
            />
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {holdings.map((h) => (
              <li
                key={h.cropId}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm dark:border-white/5 dark:bg-white/5"
              >
                <span className="font-medium text-slate-900 dark:text-white">{h.name}</span>
                <span className="text-slate-600 dark:text-slate-300">
                  {h.quantity} @ ${h.currentPrice?.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="lg:col-span-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-500">Tape snapshot</p>
          <Link to="/markets" className="text-xs font-medium text-teal-600 dark:text-neon-mint">
            All markets →
          </Link>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {crops.slice(0, 4).map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-white/5"
            >
              <p className="text-sm font-medium text-slate-900 dark:text-white">{c.name}</p>
              <p className="mt-1 text-lg text-teal-600 dark:text-neon-mint">${c.currentPrice.toFixed(2)}</p>
              <p className="text-xs text-slate-500">Demand {c.demandIndex.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
