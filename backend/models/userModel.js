import { db } from '../db/database.js';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../config.js';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  soundEnabled: true,
  notificationsEnabled: true,
};

function parseSettings(json) {
  if (!json) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    balance: row.balance,
    tutorialCompleted: !!row.tutorial_completed,
    tutorialStep: row.tutorial_step ?? 0,
    settings: parseSettings(row.settings_json),
    lastDailyRewardAt: row.last_daily_reward_at || null,
  };
}

export function findUserByEmail(email) {
  if (!email) return null;
  return db.prepare('SELECT * FROM users WHERE lower(email) = lower(?)').get(email.trim());
}

export function findUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

export function getUser(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function createUser({ email, password, username }) {
  const id = uuid();
  const now = new Date().toISOString();
  const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS);
  const uname = (username || email.split('@')[0] || 'Trader').trim().slice(0, 40);
  db.prepare(
    `INSERT INTO users (id, email, password_hash, username, balance, tutorial_completed, tutorial_step, created_at, settings_json)
     VALUES (?, ?, ?, ?, 1000, 0, 0, ?, ?)`
  ).run(id, email.trim().toLowerCase(), hash, uname, now, JSON.stringify(DEFAULT_SETTINGS));
  return getUser(id);
}

export function verifyPassword(user, password) {
  if (!user?.password_hash) return false;
  return bcrypt.compareSync(password, user.password_hash);
}

export function setBalance(userId, balance) {
  db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(balance, userId);
}

export function completeTutorial(userId) {
  db.prepare(
    'UPDATE users SET tutorial_completed = 1, tutorial_step = 0, balance = 1000 WHERE id = ?'
  ).run(userId);
}

export function setTutorialBalance(userId) {
  db.prepare('UPDATE users SET balance = 100, tutorial_step = 1 WHERE id = ?').run(userId);
}

export function setTutorialStep(userId, step) {
  db.prepare('UPDATE users SET tutorial_step = ? WHERE id = ?').run(step, userId);
}

export function updateSettings(userId, partial) {
  const u = getUser(userId);
  const next = { ...parseSettings(u.settings_json), ...partial };
  db.prepare('UPDATE users SET settings_json = ? WHERE id = ?').run(JSON.stringify(next), userId);
  return next;
}

export function resetGame(userId) {
  const now = new Date().toISOString();
  const tx = db.transaction(() => {
    db.prepare('DELETE FROM holdings WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM transactions WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM watchlist WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM portfolio_snapshots WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM achievements WHERE user_id = ?').run(userId);
    db.prepare(
      `UPDATE users SET balance = 1000, tutorial_completed = 0, tutorial_step = 0,
       last_daily_reward_at = NULL, settings_json = ? WHERE id = ?`
    ).run(JSON.stringify(DEFAULT_SETTINGS), userId);
  });
  tx();
  return getUser(userId);
}

export function claimDailyReward(userId) {
  const u = getUser(userId);
  const today = new Date().toISOString().slice(0, 10);
  const last = u.last_daily_reward_at ? u.last_daily_reward_at.slice(0, 10) : null;
  if (last === today) {
    return { ok: false, reason: 'already_claimed', balance: u.balance };
  }
  const bonus = 25;
  const newBal = Math.round((u.balance + bonus) * 100) / 100;
  const iso = new Date().toISOString();
  db.prepare('UPDATE users SET balance = ?, last_daily_reward_at = ? WHERE id = ?').run(
    newBal,
    iso,
    userId
  );
  return { ok: true, bonus, balance: newBal };
}
