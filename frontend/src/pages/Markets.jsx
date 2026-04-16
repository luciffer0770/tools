import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore.js';
import Card from '../components/Card.jsx';

export default function Markets() {
  const crops = useGameStore((s) => s.crops);
  const selectCrop = useGameStore((s) => s.selectCrop);
  const navigate = useNavigate();

  function openTrade(id) {
    selectCrop(id);
    navigate('/trade');
  }

  return (
    <div className="space-y-3">
      <div>
        <h1 className="font-display text-2xl text-white">Markets</h1>
        <p className="text-sm text-slate-400">Tap a crop to jump into the trade desk.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {crops.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => openTrade(c.id)}
            className="text-left"
          >
            <Card className="h-full hover:border-neon-mint/40">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-white">{c.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Vol {c.volatilityFactor.toFixed(2)}</p>
                </div>
                <span className="rounded-full bg-white/5 px-2 py-1 text-xs text-neon-mint">
                  ${c.currentPrice.toFixed(2)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Trend {c.trend >= 0 ? '+' : ''}{c.trend.toFixed(3)}</span>
                <span>Demand {c.demandIndex.toFixed(2)}</span>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
