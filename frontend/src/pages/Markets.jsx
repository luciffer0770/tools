import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import Card from '../components/Card.jsx';

export default function Markets() {
  const crops = useGameStore((s) => s.crops);
  const watchlist = useGameStore((s) => s.watchlist);
  const selectCrop = useGameStore((s) => s.selectCrop);
  const addWatch = useGameStore((s) => s.addWatch);
  const removeWatch = useGameStore((s) => s.removeWatch);
  const navigate = useNavigate();

  const watched = new Set(watchlist.map((w) => w.cropId));

  function openTrade(id) {
    selectCrop(id);
    navigate('/trade');
  }

  async function toggleStar(e, id) {
    e.stopPropagation();
    if (watched.has(id)) await removeWatch(id);
    else await addWatch(id);
  }

  return (
    <div className="space-y-3">
      <div>
        <h1 className="font-display text-2xl text-slate-900 dark:text-white">Markets</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Tap a card to trade. Star adds to your watchlist.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {crops.map((c) => (
          <button key={c.id} type="button" onClick={() => openTrade(c.id)} className="text-left">
            <Card className="h-full transition hover:border-teal-500/40 dark:hover:border-neon-mint/40">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{c.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Vol {c.volatilityFactor.toFixed(2)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={watched.has(c.id) ? 'Remove from watchlist' : 'Add to watchlist'}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-amber-500 transition active:scale-95 dark:border-white/10 dark:bg-white/5 dark:text-amber-300"
                    onClick={(e) => toggleStar(e, c.id)}
                  >
                    {watched.has(c.id) ? '★' : '☆'}
                  </button>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-teal-700 dark:border-white/10 dark:bg-white/5 dark:text-neon-mint">
                    ${c.currentPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Trend {c.trend >= 0 ? '+' : ''}
                  {c.trend.toFixed(3)}
                </span>
                <span>Demand {c.demandIndex.toFixed(2)}</span>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
