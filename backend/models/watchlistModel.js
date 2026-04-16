import { db } from '../db/database.js';

export function listWatchlist(userId) {
  return db
    .prepare(
      `SELECT w.crop_id as cropId, c.name, c.current_price as currentPrice, c.base_price as basePrice,
              w.created_at as addedAt
       FROM watchlist w
       JOIN crops c ON c.id = w.crop_id
       WHERE w.user_id = ?
       ORDER BY w.created_at DESC`
    )
    .all(userId);
}

export function addWatch(userId, cropId) {
  const now = new Date().toISOString();
  db.prepare(
    `INSERT OR IGNORE INTO watchlist (user_id, crop_id, created_at) VALUES (?, ?, ?)`
  ).run(userId, cropId, now);
}

export function removeWatch(userId, cropId) {
  db.prepare('DELETE FROM watchlist WHERE user_id = ? AND crop_id = ?').run(userId, cropId);
}

export function isWatching(userId, cropId) {
  const r = db
    .prepare('SELECT 1 as x FROM watchlist WHERE user_id = ? AND crop_id = ?')
    .get(userId, cropId);
  return !!r;
}
