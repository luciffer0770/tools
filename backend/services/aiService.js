import { listCrops } from '../models/cropModel.js';
import { listNews, getActiveNewsImpacts } from './newsEngine.js';
import { computePortfolioMetrics } from './portfolioAnalytics.js';

function norm(s) {
  return (s || '').toLowerCase();
}

/**
 * Rule-based assistant — no external API.
 */
export function answerQuery({ userId, message }) {
  const q = norm(message);
  const crops = listCrops();
  const news = listNews(15);
  const impacts = getActiveNewsImpacts();

  if (!q.trim()) {
    return {
      reply:
        'Ask me about a crop, the news, your portfolio risk, or what is moving today. I use live sim data only.',
    };
  }

  if (q.includes('hello') || q.includes('hi ') || q === 'hi') {
    return { reply: 'Hey — I am your CropBank desk analyst. What crop or headline should we unpack?' };
  }

  if (q.includes('trend') || q.includes('moving') || q.includes('hot')) {
    const sorted = [...crops].sort(
      (a, b) => Math.abs(b.currentPrice - b.basePrice) - Math.abs(a.currentPrice - a.basePrice)
    );
    const top = sorted.slice(0, 3).map((c) => `${c.name} (${c.currentPrice > c.basePrice ? '+' : ''}${((c.currentPrice / c.basePrice - 1) * 100).toFixed(1)}% vs base)`);
    return {
      reply: `Largest moves vs base price right now: ${top.join('; ')}. Remember: this is a simulation, not real markets.`,
    };
  }

  if (q.includes('news') || q.includes('headline')) {
    const h = news[0];
    if (!h) return { reply: 'No active headlines on the wire — calm tape. Watch for the next event batch.' };
    const cropsNamed = (h.effects || []).map((e) => {
      const c = crops.find((x) => x.id === e.cropId);
      return c?.name || 'a crop';
    });
    return {
      reply: `Latest: "${h.headline}". That bundle touches ${cropsNamed.join(', ')}. Impacts decay over the event window — good time to check your exposure.`,
    };
  }

  if (q.includes('portfolio') || q.includes('pnl') || q.includes('p&l') || q.includes('profit')) {
    if (!userId) return { reply: 'Log in and I can read your sim book. Open Portfolio for the full breakdown.' };
    const m = computePortfolioMetrics(userId);
    if (!m || m.holdings.length === 0) {
      return {
        reply: `You are ${m ? `$${m.balance.toFixed(2)}` : ''} in cash with no open crop lots. Consider a small starter position after checking Research for volatility.`,
      };
    }
    return {
      reply: `Book: ~$${m.totalValue.toFixed(2)} total (cash $${m.balance.toFixed(2)} + crops ~$${m.marketValue.toFixed(2)}). Unrealized P&L about $${m.unrealizedPl.toFixed(2)} (${m.unrealizedPlPct.toFixed(1)}% on cost). Biggest line: ${m.holdings.sort((a, b) => Math.abs(b.pl) - Math.abs(a.pl))[0]?.name}.`,
    };
  }

  const cropHit = crops.find((c) => q.includes(norm(c.name)) || q.includes(norm(c.name.split(' ')[0])));
  if (cropHit) {
    const imp = impacts[cropHit.id] || 0;
    const bias = imp > 0.3 ? 'headline support' : imp < -0.3 ? 'headline pressure' : 'neutral headline impulse';
    return {
      reply: `${cropHit.name} trades ~$${cropHit.currentPrice.toFixed(2)} (base $${cropHit.basePrice.toFixed(2)}). Demand index ${cropHit.demandIndex.toFixed(2)}, trend ${cropHit.trend >= 0 ? '+' : ''}${cropHit.trend.toFixed(3)}. Active news impulse looks ${bias} (${imp.toFixed(2)} sim units).`,
    };
  }

  if (q.includes('risk') || q.includes('volatile')) {
    const vol = [...crops].sort((a, b) => b.volatilityFactor - a.volatilityFactor)[0];
    return {
      reply: `Highest modeled volatility right now: ${vol?.name} (factor ${vol?.volatilityFactor.toFixed(2)}). Size smaller if you want a calmer ride.`,
    };
  }

  return {
    reply:
      'I match keywords to your live sim: try naming a crop, saying "news", "portfolio", "trending", or "volatile". For charts and numbers, use Research and Portfolio.',
  };
}
