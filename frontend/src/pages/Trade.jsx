import { useEffect, useMemo, useState } from 'react';
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
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

function formatTick(ts) {
  const d = new Date(ts);
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function Trade() {
  const crops = useGameStore((s) => s.crops);
  const selectedCropId = useGameStore((s) => s.selectedCropId);
  const selectCrop = useGameStore((s) => s.selectCrop);
  const loadHistory = useGameStore((s) => s.loadHistory);
  const historyByCrop = useGameStore((s) => s.historyByCrop);
  const user = useGameStore((s) => s.user);
  const holdings = useGameStore((s) => s.portfolio.holdings);
  const buy = useGameStore((s) => s.buy);
  const sell = useGameStore((s) => s.sell);
  const watchlist = useGameStore((s) => s.watchlist);
  const addWatch = useGameStore((s) => s.addWatch);
  const removeWatch = useGameStore((s) => s.removeWatch);

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [side, setSide] = useState('buy');
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const cropId = selectedCropId || crops[0]?.id;
  const crop = crops.find((c) => c.id === cropId);
  const watched = cropId ? watchlist.some((w) => w.cropId === cropId) : false;

  useEffect(() => {
    if (cropId) loadHistory(cropId);
  }, [cropId, loadHistory]);

  const chartData = useMemo(() => {
    const rows = historyByCrop[cropId] || [];
    return rows.map((r, i) => ({
      i,
      price: r.price,
      label: formatTick(r.time),
    }));
  }, [historyByCrop, cropId]);

  const holdingQty = holdings.find((h) => h.cropId === cropId)?.quantity || 0;

  async function execute() {
    if (!cropId) return;
    setBusy(true);
    setMsg(null);
    try {
      if (side === 'buy') await buy(cropId, qty);
      else await sell(cropId, qty);
      setMsg('Order filled (sim)');
    } catch (e) {
      setMsg(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!crop) {
    return <p className="text-sm text-slate-400">Loading crop data…</p>;
  }

  return (
    <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs uppercase tracking-widest text-slate-500">Crop</label>
          <select
            value={crop.id}
            onChange={(e) => selectCrop(e.target.value)}
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none ring-teal-500/30 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white sm:max-w-xs"
          >
            {crops.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <Card className={`${isDesktop ? 'h-[420px]' : 'h-[320px]'} p-2`}>
          <div className="flex items-center justify-between px-2 pb-2 text-sm">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{crop.name}</p>
              <p className="text-xs text-slate-500">Live sim price</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-lg text-amber-500 dark:border-white/10 dark:text-amber-300"
                onClick={() => (watched ? removeWatch(cropId) : addWatch(cropId))}
              >
                {watched ? '★' : '☆'}
              </button>
              <p className="font-display text-xl text-teal-600 dark:text-neon-mint">${crop.currentPrice.toFixed(2)}</p>
            </div>
          </div>
          <div className="h-[calc(100%-52px)] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5eead4" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#5eead4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis
                  domain={['auto', 'auto']}
                  width={48}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,23,42,0.95)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: '#e2e8f0' }}
                />
                <Area type="monotone" dataKey="price" stroke="#5eead4" fill="url(#fill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <details className="group mt-4 lg:mt-0" open={isDesktop}>
        <summary className="mb-3 cursor-pointer list-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
          <span className="font-medium text-slate-900 dark:text-white">Trade controls</span>
          <span className="float-right text-teal-600 group-open:rotate-180 dark:text-neon-mint">▼</span>
        </summary>
        <div className="space-y-4 lg:space-y-0">
          <Card className="lg:sticky lg:top-24">
            <div className="flex gap-2">
              <Button
                variant={side === 'buy' ? 'primary' : 'ghost'}
                className="flex-1"
                onClick={() => setSide('buy')}
              >
                Buy
              </Button>
              <Button
                variant={side === 'sell' ? 'accent' : 'ghost'}
                className="flex-1"
                onClick={() => setSide('sell')}
              >
                Sell
              </Button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span>Cash</span>
                <span className="text-slate-900 dark:text-white">${user?.balance.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Held</span>
                <span className="text-slate-900 dark:text-white">{holdingQty} units</span>
              </div>
            </div>
            <label className="mt-4 block text-xs uppercase tracking-widest text-slate-500">Quantity</label>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-3 text-base text-slate-900 outline-none ring-teal-500/30 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
              {side === 'sell' && (
                <Button variant="ghost" type="button" onClick={() => setQty(Math.max(1, holdingQty))}>
                  Max
                </Button>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Est. {side === 'buy' ? 'cost' : 'credit'}: $
              {(crop.currentPrice * qty).toFixed(2)}
            </p>
            {msg && <p className="mt-2 text-sm text-neon-pink">{msg}</p>}
            <Button className="mt-4 w-full" disabled={busy} onClick={execute}>
              {busy ? 'Working…' : side === 'buy' ? 'Place buy' : 'Place sell'}
            </Button>
          </Card>
        </div>
      </details>
    </div>
  );
}
