import { v4 as uuid } from 'uuid';
import { getCrop } from '../models/cropModel.js';
import {
  getHoldings,
  upsertHolding,
  addTransaction,
  listTransactions,
} from '../models/portfolioModel.js';
import { getUser, setBalance } from '../models/userModel.js';

export function getPortfolio(req, res) {
  try {
    const userId = req.userId;
    const user = getUser(userId);
    const holdings = getHoldings(userId);
    const transactions = listTransactions(userId, 80);
    res.json({
      balance: user.balance,
      holdings,
      transactions,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
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
    upsertHolding(userId, cropId, qty);
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
    res.json({
      ok: true,
      balance: getUser(userId).balance,
      holding: { cropId, quantity: qty },
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
    const holding = getHoldings(userId).find((h) => h.cropId === cropId);
    if (!holding || holding.quantity < qty) {
      return res.status(400).json({ error: 'Insufficient crop quantity' });
    }
    const total = Math.round(price * qty * 100) / 100;
    setBalance(userId, Math.round((user.balance + total) * 100) / 100);
    upsertHolding(userId, cropId, -qty);
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
    res.json({
      ok: true,
      balance: getUser(userId).balance,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
