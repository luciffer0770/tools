import { db } from '../db/database.js';

export function getHoldings(userId) {
  return db
    .prepare(
      `SELECT h.crop_id as cropId, h.quantity, c.name, c.current_price as currentPrice
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

export function upsertHolding(userId, cropId, quantityDelta) {
  const row = getHolding(userId, cropId);
  const next = (row?.quantity || 0) + quantityDelta;
  if (next < 0) throw new Error('Invalid quantity');
  if (next === 0) {
    db.prepare('DELETE FROM holdings WHERE user_id = ? AND crop_id = ?').run(userId, cropId);
  } else if (row) {
    db.prepare('UPDATE holdings SET quantity = ? WHERE user_id = ? AND crop_id = ?').run(
      next,
      userId,
      cropId
    );
  } else {
    db.prepare(
      'INSERT INTO holdings (user_id, crop_id, quantity) VALUES (?, ?, ?)'
    ).run(userId, cropId, next);
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
