import { useEffect, useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore.js';
import { useMediaQuery } from '../hooks/useMediaQuery.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import CropSelect from '../components/CropSelect.jsx';
import StockChart from '../components/StockChart.jsx';

const YEAR_START = 2020;
const YEAR_END = new Date().getUTCFullYear();

function yearBounds(y) {
  const from = `${y}-01-01`;
  const to = `${y}-12-31T23:59:59.999Z`;
  return { from, to };
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
  const [year, setYear] = useState(YEAR_END);
  const [range, setRange] = useState('1Y');

  const cropId = selectedCropId || crops[0]?.id;
  const crop = crops.find((c) => c.id === cropId);
  const watched = cropId ? watchlist.some((w) => w.cropId === cropId) : false;

  const historyOpts = useMemo(() => {
    if (range === 'ALL') {
      return { from: `${YEAR_START}-01-01`, maxPoints: 12000 };
    }
    if (range === '1Y') {
      const y = Math.min(YEAR_END, Math.max(YEAR_START, year));
      return { ...yearBounds(y), maxPoints: 8000 };
    }
    if (range === '5Y') {
      const endY = Math.min(YEAR_END, Math.max(YEAR_START, year));
      const startY = Math.max(YEAR_START, endY - 4);
      return { from: `${startY}-01-01`, to: `${endY}-12-31T23:59:59.999Z`, maxPoints: 10000 };
    }
    const end = new Date();
    const start = new Date(end);
    if (range === '1M') start.setUTCMonth(start.getUTCMonth() - 1);
    if (range === '3M') start.setUTCMonth(start.getUTCMonth() - 3);
    if (range === '6M') start.setUTCMonth(start.getUTCMonth() - 6);
    return { from: start.toISOString(), to: end.toISOString(), maxPoints: 6000 };
  }, [range, year]);

  useEffect(() => {
    if (cropId) loadHistory(cropId, historyOpts);
  }, [cropId, loadHistory, historyOpts]);

  const historyRows = historyByCrop[cropId] || [];

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

  const yearOptions = [];
  for (let y = YEAR_END; y >= YEAR_START; y--) yearOptions.push(y);

  return (
    <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-end gap-2">
          <span className="w-full text-xs uppercase tracking-widest text-slate-500 sm:w-auto sm:pt-3">Symbol</span>
          <CropSelect crops={crops} value={crop.id} onChange={(id) => selectCrop(id)} />
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50/90 p-2 dark:border-white/10 dark:bg-white/5 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap gap-1">
            {[
              { id: '1M', label: '1M' },
              { id: '3M', label: '3M' },
              { id: '6M', label: '6M' },
              { id: '1Y', label: '1Y' },
              { id: '5Y', label: '5Y' },
              { id: 'ALL', label: 'All' },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                className={`min-h-[40px] rounded-lg px-3 text-xs font-semibold ${
                  range === r.id
                    ? 'bg-teal-600 text-white dark:bg-neon-mint dark:text-slate-900'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-white/10'
                }`}
                onClick={() => setRange(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
          {(range === '1Y' || range === '5Y') && (
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="shrink-0">Year</span>
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="min-h-[40px] flex-1 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-900 dark:border-white/15 dark:bg-slate-900 dark:text-white sm:max-w-[140px]"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Candle chart (TradingView Lightweight Charts™): drag to pan, pinch or scroll to zoom — like a stock terminal.
          Simulated daily OHLC from closes; not real markets.
        </p>

        <Card className={`${isDesktop ? 'h-[480px]' : 'h-[380px]'} flex flex-col p-2`}>
          <div className="flex shrink-0 items-center justify-between px-2 pb-2 text-sm">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">{crop.name}</p>
              <p className="text-xs text-slate-500">Last · sim</p>
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
          <div className="min-h-0 flex-1">
            <StockChart history={historyRows} emptyHint="Loading chart…" />
          </div>
        </Card>
      </div>

      <details className="group mt-4 lg:mt-0" open={isDesktop}>
        <summary className="mb-3 cursor-pointer list-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 lg:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
          <span className="font-medium text-slate-900 dark:text-white">Order ticket</span>
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
