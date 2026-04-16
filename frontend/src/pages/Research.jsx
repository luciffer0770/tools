import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import Card from '../components/Card.jsx';
import PageLoader from '../components/PageLoader.jsx';

export default function Research() {
  const research = useGameStore((s) => s.research);
  const refreshResearch = useGameStore((s) => s.refreshResearch);
  const pageLoading = useGameStore((s) => s.pageLoading);
  const setPageLoading = useGameStore((s) => s.setPageLoading);

  useEffect(() => {
    (async () => {
      setPageLoading(true);
      try {
        await refreshResearch();
      } finally {
        setPageLoading(false);
      }
    })();
  }, [refreshResearch, setPageLoading]);

  if (!research && pageLoading) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-slate-900 dark:text-white">Research</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Rule-based desk views from live sim prices and headlines.
          </p>
        </div>
        <Link to="/trade" className="text-sm font-medium text-teal-600 dark:text-neon-mint">
          Open trade desk →
        </Link>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-widest text-slate-500">AI-style insights</p>
          <ul className="mt-3 space-y-3">
            {(research?.insights || []).map((ins) => (
              <li key={ins.id} className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-white/5 dark:bg-white/5">
                <p className="font-medium text-slate-900 dark:text-white">{ins.title}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{ins.detail}</p>
              </li>
            ))}
            {(!research?.insights || research.insights.length === 0) && (
              <p className="text-sm text-slate-500">Gathering signals…</p>
            )}
          </ul>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-slate-500">Most volatile (factor)</p>
          <ul className="mt-2 divide-y divide-slate-200 dark:divide-white/5">
            {(research?.volatile || []).map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-slate-900 dark:text-white">{c.name}</span>
                <span className="font-mono text-slate-600 dark:text-slate-400">{c.volatilityFactor?.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <p className="text-xs uppercase tracking-widest text-slate-500">Trending (vs base)</p>
          <ul className="mt-2 space-y-2">
            {(research?.trending || []).map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-white/5"
              >
                <span className="text-slate-900 dark:text-white">{c.name}</span>
                <span className={c.pctFromBase >= 0 ? 'text-teal-600 dark:text-neon-mint' : 'text-rose-600 dark:text-neon-pink'}>
                  {c.pctFromBase >= 0 ? '+' : ''}
                  {c.pctFromBase?.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-slate-500">Gainers / Losers</p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs text-teal-600 dark:text-neon-mint">Gainers</p>
              <ul className="mt-1 space-y-1 text-sm">
                {(research?.gainers || []).slice(0, 5).map((c) => (
                  <li key={c.id} className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>{c.name}</span>
                    <span>+{c.pctFromBase?.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs text-rose-600 dark:text-neon-pink">Losers</p>
              <ul className="mt-1 space-y-1 text-sm">
                {(research?.losers || []).slice(0, 5).map((c) => (
                  <li key={c.id} className="flex justify-between text-slate-700 dark:text-slate-300">
                    <span>{c.name}</span>
                    <span>{c.pctFromBase?.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
