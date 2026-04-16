import { v4 as uuid } from 'uuid';
import { getCrop } from '../models/cropModel.js';
import {
  applyBuy,
  applySell,
  addTransaction,
  listTransactions,
  recordPortfolioSnapshot,
} from '../models/portfolioModel.js';
import { getUser, setBalance } from '../models/userModel.js';
import { computePortfolioMetrics } from '../services/portfolioAnalytics.js';
import { unlockAchievement } from '../models/achievementModel.js';

function snap(userId) {
  const m = computePortfolioMetrics(userId);
  if (!m) return;
  recordPortfolioSnapshot(userId, {
    totalValue: m.totalValue,
    invested: m.invested,
    cash: m.balance,
  });
}

function checkAchievements(userId) {
  const m = computePortfolioMetrics(userId);
  if (!m) return [];
  const unlocked = [];
  const txCount = listTransactions(userId, 500).length;
  if (txCount > 0 && unlockAchievement(userId, 'first_trade')) unlocked.push('first_trade');
  if (m.unrealizedPlPct >= 10 && unlockAchievement(userId, 'profit_10pct')) unlocked.push('profit_10pct');
  return unlocked;
}

export function buy(req, res) {
  try {
    const userId = req.userId;
    const { cropId, quantity } = req.body || {};
    const qty = Math.floor(Number(quantity));
    if (!cropId || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Invalid crop or quantity' });
    }
    const crop = getCrop(cropId);
    if (!crop) return res.status(404).json({ error: 'Crop not found' });
    const user = getUser(userId);
    const price = crop.currentPrice;
    const total = Math.round(price * qty * 100) / 100;
    if (user.balance < total) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    setBalance(userId, Math.round((user.balance - total) * 100) / 100);
    applyBuy(userId, cropId, qty, price);
    addTransaction({
      id: uuid(),
      userId,
      cropId,
      type: 'buy',
      quantity: qty,
      price,
      total,
      createdAt: new Date().toISOString(),
    });
    snap(userId);
    const achievements = checkAchievements(userId);
    res.json({
      ok: true,
      balance: getUser(userId).balance,
      holding: { cropId, quantity: qty },
      achievements,
      toast: 'Fill confirmed — position updated.',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function sell(req, res) {
  try {
    const userId = req.userId;
    const { cropId, quantity } = req.body || {};
    const qty = Math.floor(Number(quantity));
    if (!cropId || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Invalid crop or quantity' });
    }
    const crop = getCrop(cropId);
    if (!crop) return res.status(404).json({ error: 'Crop not found' });
    const user = getUser(userId);
    const price = crop.currentPrice;
    const metrics = computePortfolioMetrics(userId);
    const holding = metrics.holdings.find((h) => h.cropId === cropId);
    if (!holding || holding.quantity < qty) {
      return res.status(400).json({ error: 'Insufficient crop quantity' });
    }
    const total = Math.round(price * qty * 100) / 100;
    setBalance(userId, Math.round((user.balance + total) * 100) / 100);
    applySell(userId, cropId, qty);
    addTransaction({
      id: uuid(),
      userId,
      cropId,
      type: 'sell',
      quantity: qty,
      price,
      total,
      createdAt: new Date().toISOString(),
    });
    snap(userId);
    const achievements = checkAchievements(userId);
    res.json({
      ok: true,
      balance: getUser(userId).balance,
      achievements,
      toast: 'Sale filled — cash credited.',
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
