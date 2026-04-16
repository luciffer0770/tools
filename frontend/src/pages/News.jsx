import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore.js';
import Card from '../components/Card.jsx';

function impactTag(value) {
  if (!value) return { label: 'Neutral', cls: 'text-slate-600 border-slate-200 dark:text-slate-300 dark:border-white/10' };
  if (value > 0)
    return { label: `+${value.toFixed(2)}`, cls: 'text-teal-700 border-teal-500/40 dark:text-neon-mint dark:border-neon-mint/40' };
  return { label: value.toFixed(2), cls: 'text-rose-700 border-rose-500/40 dark:text-neon-pink dark:border-neon-pink/40' };
}

export default function NewsPage() {
  const news = useGameStore((s) => s.news);
  const crops = useGameStore((s) => s.crops);

  const cropName = useMemo(() => {
    const map = Object.fromEntries(crops.map((c) => [c.id, c.name]));
    return (id) => map[id] || id.slice(0, 6);
  }, [crops]);

  return (
    <div className="space-y-3">
      <div>
        <h1 className="font-display text-2xl text-slate-900 dark:text-white">News desk</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Headlines decay over time — watch your positions.</p>
      </div>
      <div className="space-y-3">
        {news.length === 0 && <p className="text-sm text-slate-500">Waiting for the wire…</p>}
        {news.map((n) => (
          <Card key={n.id}>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{n.headline}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{n.body}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {n.effects?.map((e) => {
                const tag = impactTag(e.initialImpact);
                return (
                  <span key={e.cropId} className={`rounded-full border px-3 py-1 text-xs ${tag.cls}`}>
                    {cropName(e.cropId)} · {tag.label}
                  </span>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] uppercase tracking-widest text-slate-500">
              Window {Math.round(n.durationSec)}s · Decay active
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
