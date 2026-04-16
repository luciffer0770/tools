import { db } from '../db/database.js';

export function getHoldings(userId) {
  return db
    .prepare(
      `SELECT h.crop_id as cropId, h.quantity, h.avg_cost_basis as avgCostBasis,
              c.name, c.current_price as currentPrice
       FROM holdings h
       JOIN crops c ON c.id = h.crop_id
       WHERE h.user_id = ? AND h.quantity > 0`
    )
    .all(userId);
}

export function getHolding(userId, cropId) {
  return db
    .prepare('SELECT * FROM holdings WHERE user_id = ? AND crop_id = ?')
    .get(userId, cropId);
}

/**
 * Weighted average cost on buy; quantity and avg_cost_basis updated.
 */
export function applyBuy(userId, cropId, qty, pricePerUnit) {
  const row = getHolding(userId, cropId);
  const oldQ = row?.quantity || 0;
  const oldAvg = row?.avg_cost_basis || 0;
  const newQ = oldQ + qty;
  const newAvg =
    newQ > 0
      ? Math.round(((oldQ * oldAvg + qty * pricePerUnit) / newQ) * 10000) / 10000
      : pricePerUnit;

  if (row) {
    db.prepare(
      'UPDATE holdings SET quantity = ?, avg_cost_basis = ? WHERE user_id = ? AND crop_id = ?'
    ).run(newQ, newAvg, userId, cropId);
  } else {
    db.prepare(
      `INSERT INTO holdings (user_id, crop_id, quantity, avg_cost_basis)
       VALUES (?, ?, ?, ?)`
    ).run(userId, cropId, newQ, newAvg);
  }
}

/**
 * Sell reduces quantity; avg cost basis unchanged for remaining lots.
 */
export function applySell(userId, cropId, qty) {
  const row = getHolding(userId, cropId);
  if (!row || row.quantity < qty) throw new Error('Insufficient crop quantity');
  const next = row.quantity - qty;
  if (next === 0) {
    db.prepare('DELETE FROM holdings WHERE user_id = ? AND crop_id = ?').run(userId, cropId);
  } else {
    db.prepare('UPDATE holdings SET quantity = ? WHERE user_id = ? AND crop_id = ?').run(
      next,
      userId,
      cropId
    );
  }
}

export function listTransactions(userId, limit = 100) {
  return db
    .prepare(
      `SELECT t.id, t.crop_id as cropId, c.name as cropName, t.type, t.quantity, t.price, t.total, t.created_at as createdAt
       FROM transactions t
       JOIN crops c ON c.id = t.crop_id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC
       LIMIT ?`
    )
    .all(userId, limit);
}

export function addTransaction(row) {
  db.prepare(
    `INSERT INTO transactions (id, user_id, crop_id, type, quantity, price, total, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    row.id,
    row.userId,
    row.cropId,
    row.type,
    row.quantity,
    row.price,
    row.total,
    row.createdAt
  );
}

export function recordPortfolioSnapshot(userId, { totalValue, invested, cash }) {
  db.prepare(
    `INSERT INTO portfolio_snapshots (user_id, ts, total_value, invested, cash)
     VALUES (?, ?, ?, ?, ?)`
  ).run(userId, new Date().toISOString(), totalValue, invested, cash);
}

export function listSnapshots(userId, limit = 200) {
  return db
    .prepare(
      `SELECT ts as time, total_value as totalValue, invested, cash
       FROM portfolio_snapshots WHERE user_id = ? ORDER BY ts DESC LIMIT ?`
    )
    .all(userId, limit)
    .reverse();
}
