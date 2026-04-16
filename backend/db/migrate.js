import { db } from './database.js';
import bcrypt from 'bcryptjs';
import { BCRYPT_ROUNDS } from '../config.js';

/**
 * Incremental SQLite migrations for CropBank.
 * Safe to run on every server start.
 */
export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY,
      version INTEGER NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = new Set(
    db.prepare('SELECT version FROM schema_migrations').all().map((r) => r.version)
  );

  const migrations = [
    {
      version: 2,
      up() {
        const cols = db.prepare('PRAGMA table_info(users)').all();
        const names = cols.map((c) => c.name);
        if (!names.includes('email')) {
          db.exec(`ALTER TABLE users ADD COLUMN email TEXT`);
        }
        if (!names.includes('password_hash')) {
          db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT`);
        }
        if (!names.includes('settings_json')) {
          db.exec(`ALTER TABLE users ADD COLUMN settings_json TEXT`);
        }
        if (!names.includes('last_daily_reward_at')) {
          db.exec(`ALTER TABLE users ADD COLUMN last_daily_reward_at TEXT`);
        }
        if (!names.includes('tutorial_step')) {
          db.exec(`ALTER TABLE users ADD COLUMN tutorial_step INTEGER NOT NULL DEFAULT 0`);
        }
        const hcols = db.prepare('PRAGMA table_info(holdings)').all().map((c) => c.name);
        if (!hcols.includes('avg_cost_basis')) {
          db.exec(`ALTER TABLE holdings ADD COLUMN avg_cost_basis REAL NOT NULL DEFAULT 0`);
        }
        db.exec(`
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
          CREATE INDEX IF NOT EXISTS idx_snapshots_user_ts ON portfolio_snapshots(user_id, ts);
        `);
        const legacyPass = bcrypt.hashSync('CropBank2024!', BCRYPT_ROUNDS);
        const rows = db.prepare(`SELECT id, username FROM users WHERE email IS NULL OR trim(email) = ''`).all();
        for (const r of rows) {
          const email = `migrated-${r.id}@cropbank.local`;
          db.prepare(
            `UPDATE users SET email = ?, password_hash = COALESCE(password_hash, ?) WHERE id = ?`
          ).run(email, legacyPass, r.id);
        }
        try {
          db.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)').run();
        } catch {
          /* ignore */
        }
      },
    },
  ];

  const insert = db.prepare(
    'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)'
  );

  for (const m of migrations) {
    if (applied.has(m.version)) continue;
    const tx = db.transaction(() => {
      m.up();
      insert.run(m.version, new Date().toISOString());
    });
    tx();
  }
}
