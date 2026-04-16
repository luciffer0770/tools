import { useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useGameStore } from '../store/gameStore.js';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageLoader from '../components/PageLoader.jsx';

function fmtTime(ts) {
  const d = new Date(ts);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function Portfolio() {
  const portfolio = useGameStore((s) => s.portfolio);
  const pageLoading = useGameStore((s) => s.pageLoading);
  const refreshPortfolio = useGameStore((s) => s.refreshPortfolio);
  const setPageLoading = useGameStore((s) => s.setPageLoading);

  useEffect(() => {
    (async () => {
      setPageLoading(true);
      try {
        await refreshPortfolio();
      } finally {
        setPageLoading(false);
      }
    })();
  }, [refreshPortfolio, setPageLoading]);

  const chartData = useMemo(() => {
    const rows = portfolio.portfolioHistory || [];
    return rows.map((r, i) => ({
      i,
      v: r.totalValue,
      label: fmtTime(r.time),
    }));
  }, [portfolio.portfolioHistory]);

  const achLabels = {
    first_trade: 'First trade',
    profit_10pct: '10% unrealized gain',
  };

  if (pageLoading && !portfolio.transactions?.length) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl text-slate-900 dark:text-white">Portfolio</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Cost basis, mark-to-market, and sim P&amp;L — not real brokerage data.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs uppercase tracking-widest text-slate-500">Cash</p>
          <p className="mt-1 font-display text-2xl text-teal-600 dark:text-neon-mint">
            ${portfolio.balance?.toFixed(2)}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-slate-500">Invested (cost)</p>
          <p className="mt-1 font-display text-2xl text-slate-900 dark:text-white">
            ${portfolio.invested?.toFixed(2)}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-slate-500">Market value</p>
          <p className="mt-1 font-display text-2xl text-slate-900 dark:text-white">
            ${portfolio.marketValue?.toFixed(2)}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-widest text-slate-500">Unrealized P&amp;L</p>
          <p
            className={`mt-1 font-display text-2xl ${
              (portfolio.unrealizedPl || 0) >= 0
                ? 'text-teal-600 dark:text-neon-mint'
                : 'text-rose-600 dark:text-neon-pink'
            }`}
          >
            ${portfolio.unrealizedPl?.toFixed(2)}{' '}
            <span className="text-base font-normal text-slate-500">
              ({portfolio.unrealizedPlPct?.toFixed(1)}%)
            </span>
          </p>
        </Card>
      </div>

      <Card className="p-2 sm:p-4">
        <p className="mb-2 px-2 text-xs uppercase tracking-widest text-slate-500">Total equity (sim)</p>
        <div className="h-56 w-full sm:h-72">
          {chartData.length < 2 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Chart fills as snapshots accumulate (about a minute per tick per user).
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="pv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} className="dark:stop-color-[#5eead4]" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700/50" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} />
                <YAxis width={52} tick={{ fontSize: 10, fill: '#64748b' }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid rgba(148,163,184,0.3)',
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="v" name="Total" stroke="#0d9488" fill="url(#pv)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-widest text-slate-500">Holdings</p>
        {portfolio.holdings?.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No open positions"
              hint="Buy a crop on the Trade tab to see cost basis and P&L here."
            />
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {portfolio.holdings.map((h) => (
              <div
                key={h.cropId}
                className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/80 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/5 dark:bg-white/5"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{h.name}</p>
                  <p className="text-xs text-slate-500">
                    {h.quantity} @ avg ${h.avgBuyPrice?.toFixed(2)} → now ${h.currentPrice?.toFixed(2)}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-slate-600 dark:text-slate-300">
                    Mkt ${h.marketValue?.toFixed(2)} · Cost ${h.costBasis?.toFixed(2)}
                  </p>
                  <p className={h.pl >= 0 ? 'text-teal-600 dark:text-neon-mint' : 'text-rose-600 dark:text-neon-pink'}>
                    P&amp;L ${h.pl?.toFixed(2)} ({h.plPct?.toFixed(1)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <p className="text-xs uppercase tracking-widest text-slate-500">Achievements</p>
        {(portfolio.achievements || []).length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Complete a trade or hit +10% unrealized on cost to unlock badges.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {portfolio.achievements.map((a) => (
              <li
                key={a.key}
                className="rounded-full border border-teal-500/30 bg-teal-500/10 px-3 py-1 text-xs font-medium text-teal-800 dark:border-neon-mint/30 dark:bg-neon-mint/10 dark:text-neon-mint"
              >
                {achLabels[a.key] || a.key}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
