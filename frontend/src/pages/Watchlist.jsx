import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageLoader from '../components/PageLoader.jsx';
import Button from '../components/Button.jsx';

export default function Watchlist() {
  const watchlist = useGameStore((s) => s.watchlist);
  const crops = useGameStore((s) => s.crops);
  const refreshWatchlist = useGameStore((s) => s.refreshWatchlist);
  const removeWatch = useGameStore((s) => s.removeWatch);
  const selectCrop = useGameStore((s) => s.selectCrop);
  const pageLoading = useGameStore((s) => s.pageLoading);
  const setPageLoading = useGameStore((s) => s.setPageLoading);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setPageLoading(true);
      try {
        await refreshWatchlist();
      } finally {
        setPageLoading(false);
      }
    })();
  }, [refreshWatchlist, setPageLoading]);

  const baseById = Object.fromEntries(crops.map((c) => [c.id, c.basePrice]));
  const liveById = Object.fromEntries(crops.map((c) => [c.id, c.currentPrice]));

  if (pageLoading && watchlist.length === 0) return <PageLoader />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl text-slate-900 dark:text-white">Watchlist</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Pinned crops update with the live tape.</p>
      </div>
      {watchlist.length === 0 ? (
        <EmptyState
          title="Nothing starred yet"
          hint="Open Markets and tap the star on any crop, or add from Trade."
          action={
            <Button variant="ghost" onClick={() => navigate('/markets')}>
              Browse markets
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {watchlist.map((w) => {
            const live = liveById[w.cropId] ?? w.currentPrice;
            const base = baseById[w.cropId] ?? w.basePrice ?? live;
            const delta = base ? ((live - base) / base) * 100 : 0;
            return (
              <Card key={w.cropId} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  className="text-left"
                  onClick={() => {
                    selectCrop(w.cropId);
                    navigate('/trade');
                  }}
                >
                  <p className="font-medium text-slate-900 dark:text-white">{w.name}</p>
                  <p className="text-sm text-slate-500">Tap to trade</p>
                </button>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-display text-lg text-teal-600 dark:text-neon-mint">${live?.toFixed(2)}</p>
                    <p className={`text-xs ${delta >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                      {delta >= 0 ? '+' : ''}
                      {delta.toFixed(2)}% vs base
                    </p>
                  </div>
                  <Button variant="ghost" onClick={() => removeWatch(w.cropId)}>
                    Remove
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
