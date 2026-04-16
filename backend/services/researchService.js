import { listCrops } from '../models/cropModel.js';
import { listNews } from './newsEngine.js';
import { getActiveNewsImpacts } from './newsEngine.js';

export function buildResearchReport() {
  const crops = listCrops();
  const news = listNews(12);
  const impacts = getActiveNewsImpacts();

  const withMove = crops.map((c) => {
    const pct = c.basePrice ? ((c.currentPrice / c.basePrice - 1) * 100) : 0;
    return { ...c, pctFromBase: pct, newsImpulse: impacts[c.id] || 0 };
  });

  const trending = [...withMove]
    .sort((a, b) => Math.abs(b.pctFromBase) - Math.abs(a.pctFromBase))
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      name: c.name,
      currentPrice: c.currentPrice,
      pctFromBase: Math.round(c.pctFromBase * 100) / 100,
      demandIndex: c.demandIndex,
      trend: c.trend,
    }));

  const volatile = [...crops]
    .sort((a, b) => b.volatilityFactor - a.volatilityFactor)
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      name: c.name,
      volatilityFactor: c.volatilityFactor,
      currentPrice: c.currentPrice,
    }));

  const gainers = [...withMove].sort((a, b) => b.pctFromBase - a.pctFromBase).slice(0, 5);
  const losers = [...withMove].sort((a, b) => a.pctFromBase - b.pctFromBase).slice(0, 5);

  const insights = [];

  const topNews = news[0];
  if (topNews) {
    const affected = (topNews.effects || [])
      .map((e) => crops.find((c) => c.id === e.cropId)?.name)
      .filter(Boolean);
    insights.push({
      id: 'news-lead',
      title: 'Lead headline',
      detail: `${topNews.headline} — watch ${affected.join(', ') || 'linked crops'} for drift while the effect decays.`,
    });
  }

  const hot = trending[0];
  if (hot) {
    insights.push({
      id: 'mover',
      title: 'Largest deviation from base',
      detail: `${hot.name} is ${hot.pctFromBase >= 0 ? 'up' : 'down'} ${Math.abs(hot.pctFromBase).toFixed(1)}% vs its modeled base — sim demand and events are mixing.`,
    });
  }

  const v = volatile[0];
  if (v) {
    insights.push({
      id: 'vol',
      title: 'Volatility watch',
      detail: `${v.name} carries the highest volatility factor (${v.volatilityFactor.toFixed(2)}), so expect wider swings on each tick.`,
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    trending,
    volatile,
    gainers: gainers.map((c) => ({
      id: c.id,
      name: c.name,
      pctFromBase: Math.round(c.pctFromBase * 100) / 100,
      currentPrice: c.currentPrice,
    })),
    losers: losers.map((c) => ({
      id: c.id,
      name: c.name,
      pctFromBase: Math.round(c.pctFromBase * 100) / 100,
      currentPrice: c.currentPrice,
    })),
    insights,
  };
}
