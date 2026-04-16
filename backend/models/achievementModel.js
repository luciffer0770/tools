import { db } from '../db/database.js';

export function listAchievements(userId) {
  return db
    .prepare('SELECT key, unlocked_at as unlockedAt FROM achievements WHERE user_id = ?')
    .all(userId);
}

export function unlockAchievement(userId, key) {
  const now = new Date().toISOString();
  const info = db
    .prepare(
      `INSERT OR IGNORE INTO achievements (user_id, key, unlocked_at) VALUES (?, ?, ?)`
    ).run(userId, key, now);
  return info.changes > 0;
}

export function hasAchievement(userId, key) {
  return !!db
    .prepare('SELECT 1 as x FROM achievements WHERE user_id = ? AND key = ?')
    .get(userId, key);
}
