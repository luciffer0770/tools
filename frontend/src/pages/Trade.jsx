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
import CropSelect from '../components/CropSelect.jsx';

function formatAxisLabel(ms, spanDays) {
  const d = new Date(ms);
  if (spanDays > 730) {
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  }
  if (spanDays > 60) {
    return `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${String(d.getUTCDate()).padStart(2, '0')}`;
  }
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

function tooltipLabel(ms, spanDays) {
  const d = new Date(ms);
  if (spanDays > 730) return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });
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
    return rows.map((r) => {
      const timeMs = Date.parse(r.time);
      return {
        timeMs: Number.isFinite(timeMs) ? timeMs : 0,
        price: r.price,
      };
    });
  }, [historyByCrop, cropId]);

  const spanDays = useMemo(() => {
    if (chartData.length < 2) return 0;
    const a = chartData[0].timeMs;
    const b = chartData[chartData.length - 1].timeMs;
    return Math.max(0, (b - a) / (86400000));
  }, [chartData]);

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
        <div className="flex flex-wrap items-end gap-2">
          <span className="w-full text-xs uppercase tracking-widest text-slate-500 sm:w-auto sm:pt-3">Crop</span>
          <CropSelect crops={crops} value={crop.id} onChange={(id) => selectCrop(id)} />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Chart: daily sim history from 2020 (downsampled for speed) + live ticks. Not real market data.
        </p>
        <Card className={`${isDesktop ? 'h-[440px]' : 'h-[340px]'} p-2`}>
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
          <div className="h-[calc(100%-52px)] w-full min-h-[200px]">
            {chartData.length < 2 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">Loading chart…</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillTrade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
                  <XAxis
                    dataKey="timeMs"
                    type="number"
                    domain={['dataMin', 'dataMax']}
                    scale="time"
                    tickFormatter={(v) => formatAxisLabel(v, spanDays)}
                    minTickGap={32}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    width={52}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <Tooltip
                    labelFormatter={(v) => tooltipLabel(v, spanDays)}
                    formatter={(v) => [`$${Number(v).toFixed(2)}`, 'Price']}
                    contentStyle={{
                      background: 'rgba(15,23,42,0.95)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#0d9488"
                    fill="url(#fillTrade)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={chartData.length < 400}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
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
            {msg && (
              <p className="mt-2 text-sm text-rose-600 dark:text-neon-pink" role="status">
                {msg}
              </p>
            )}
            <Button className="mt-4 w-full" disabled={busy} onClick={execute}>
              {busy ? 'Working…' : side === 'buy' ? 'Place buy' : 'Place sell'}
            </Button>
          </Card>
        </div>
      </details>
    </div>
  );
}
