import { db } from '../db/database.js';
import { v4 as uuid } from 'uuid';

export function findUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

export function createUser(username) {
  const id = uuid();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO users (id, username, balance, tutorial_completed, created_at)
     VALUES (?, ?, 1000, 0, ?)`
  ).run(id, username, now);
  return getUser(id);
}

export function getUser(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function setBalance(userId, balance) {
  db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(balance, userId);
}

export function completeTutorial(userId) {
  db.prepare('UPDATE users SET tutorial_completed = 1, balance = 1000 WHERE id = ?').run(
    userId
  );
}

export function setTutorialBalance(userId) {
  db.prepare('UPDATE users SET balance = 100 WHERE id = ?').run(userId);
}
