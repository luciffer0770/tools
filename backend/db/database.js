import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
mkdirSync(dataDir, { recursive: true });
const dbPath = join(dataDir, 'cropbank.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE,
      password_hash TEXT,
      username TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 1000,
      tutorial_completed INTEGER NOT NULL DEFAULT 0,
      tutorial_step INTEGER NOT NULL DEFAULT 0,
      settings_json TEXT,
      last_daily_reward_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS crops (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      base_price REAL NOT NULL,
      current_price REAL NOT NULL,
      volatility_factor REAL NOT NULL,
      demand_index REAL NOT NULL,
      trend REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS holdings (
      user_id TEXT NOT NULL,
      crop_id TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      avg_cost_basis REAL NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, crop_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (crop_id) REFERENCES crops(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      crop_id TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      total REAL NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (crop_id) REFERENCES crops(id)
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      user_id TEXT NOT NULL,
      crop_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, crop_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (crop_id) REFERENCES crops(id)
    );

    CREATE TABLE IF NOT EXISTS portfolio_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      ts TEXT NOT NULL,
      total_value REAL NOT NULL,
      invested REAL NOT NULL,
      cash REAL NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS achievements (
      user_id TEXT NOT NULL,
      key TEXT NOT NULL,
      unlocked_at TEXT NOT NULL,
      PRIMARY KEY (user_id, key),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS news_events (
      id TEXT PRIMARY KEY,
      headline TEXT NOT NULL,
      body TEXT NOT NULL,
      started_at TEXT NOT NULL,
      duration_sec INTEGER NOT NULL,
      decay_rate REAL NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS news_crop_effects (
      event_id TEXT NOT NULL,
      crop_id TEXT NOT NULL,
      initial_impact REAL NOT NULL,
      PRIMARY KEY (event_id, crop_id),
      FOREIGN KEY (event_id) REFERENCES news_events(id),
      FOREIGN KEY (crop_id) REFERENCES crops(id)
    );

    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      crop_id TEXT NOT NULL,
      price REAL NOT NULL,
      ts TEXT NOT NULL,
      FOREIGN KEY (crop_id) REFERENCES crops(id)
    );

    CREATE INDEX IF NOT EXISTS idx_price_history_crop_ts ON price_history(crop_id, ts);
    CREATE INDEX IF NOT EXISTS idx_snapshots_user_ts ON portfolio_snapshots(user_id, ts);
  `);
}
