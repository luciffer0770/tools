import { getUser } from '../models/userModel.js';
import { getHoldings } from '../models/portfolioModel.js';

export function computePortfolioMetrics(userId) {
  const user = getUser(userId);
  if (!user) return null;
  const holdings = getHoldings(userId);

  let invested = 0;
  let marketValue = 0;
  const lines = holdings.map((h) => {
    const qty = h.quantity;
    const avg = h.avgCostBasis || h.currentPrice;
    const cost = qty * avg;
    const mkt = qty * h.currentPrice;
    const pl = mkt - cost;
    const plPct = cost > 0 ? (pl / cost) * 100 : 0;
    invested += cost;
    marketValue += mkt;
    return {
      cropId: h.cropId,
      name: h.name,
      quantity: qty,
      avgBuyPrice: avg,
      currentPrice: h.currentPrice,
      costBasis: Math.round(cost * 100) / 100,
      marketValue: Math.round(mkt * 100) / 100,
      pl: Math.round(pl * 100) / 100,
      plPct: Math.round(plPct * 100) / 100,
    };
  });

  const cash = user.balance;
  const totalValue = Math.round((cash + marketValue) * 100) / 100;
  const unrealizedPl = Math.round((marketValue - invested) * 100) / 100;
  const unrealizedPlPct = invested > 0 ? Math.round((unrealizedPl / invested) * 10000) / 100 : 0;

  return {
    balance: cash,
    invested: Math.round(invested * 100) / 100,
    marketValue: Math.round(marketValue * 100) / 100,
    totalValue,
    unrealizedPl,
    unrealizedPlPct,
    holdings: lines,
  };
}
