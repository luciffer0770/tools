import { db } from '../db/database.js';
import { v4 as uuid } from 'uuid';
import { getActiveNewsImpacts } from './newsEngine.js';

const DEMAND_MULTIPLIER = 2.5;
const MAX_STEP_PCT = 0.04;
const MIN_PRICE = 0.5;

function clampStep(oldPrice, nextPrice) {
  const maxDelta = oldPrice * MAX_STEP_PCT;
  const delta = nextPrice - oldPrice;
  if (Math.abs(delta) <= maxDelta) return nextPrice;
  return oldPrice + Math.sign(delta) * maxDelta;
}

function randomVolatility() {
  return (Math.random() - 0.5) * 2;
}

export function computeNextPrice(crop, newsImpact) {
  const base = crop.base_price;
  const volPart = randomVolatility() * crop.volatility_factor;
  const demandPart = crop.demand_index * DEMAND_MULTIPLIER;
  const trendPart = crop.trend * base * 0.02;
  let raw = base + volPart + newsImpact + demandPart + trendPart;
  const smoothed = crop.current_price * 0.35 + raw * 0.65;
  const stepped = clampStep(crop.current_price, smoothed);
  return Math.max(MIN_PRICE, Math.round(stepped * 100) / 100);
}

export function tickPrices() {
  const crops = db.prepare('SELECT * FROM crops').all();
  const impacts = getActiveNewsImpacts();
  const update = db.prepare(
    'UPDATE crops SET current_price = ?, demand_index = ?, trend = ? WHERE id = ?'
  );
  const insertHist = db.prepare(
    'INSERT INTO price_history (crop_id, price, ts) VALUES (?, ?, ?)'
  );
  const now = new Date().toISOString();

  const tx = db.transaction(() => {
    for (const c of crops) {
      const newsImpact = impacts[c.id] || 0;
      const next = computeNextPrice(c, newsImpact);
      let demand = c.demand_index + (Math.random() - 0.5) * 0.03;
      demand = Math.max(-1, Math.min(1, demand));
      let trend = c.trend + (Math.random() - 0.5) * 0.002;
      trend = Math.max(-0.05, Math.min(0.05, trend));
      update.run(next, demand, trend, c.id);
      insertHist.run(c.id, next, now);
    }
  });
  tx();
  return db.prepare('SELECT * FROM crops').all();
}

export function appendInitialHistory() {
  const crops = db.prepare('SELECT id, current_price FROM crops').all();
  const now = new Date().toISOString();
  const insert = db.prepare(
    'INSERT INTO price_history (crop_id, price, ts) VALUES (?, ?, ?)'
  );
  const tx = db.transaction(() => {
    for (const c of crops) insert.run(c.id, c.current_price, now);
  });
  tx();
}

export function getHistory(cropId, limit = 120) {
  return db
    .prepare(
      `SELECT price as price, ts as time FROM price_history WHERE crop_id = ? ORDER BY ts DESC LIMIT ?`
    )
    .all(cropId, limit)
    .reverse();
}

/**
 * Long-range history (oldest first). Optional `from` / `to` ISO date filters on ts.
 * `maxPoints` downsamples by taking every k-th row so charts stay light.
 */
export function getHistoryRange(cropId, { from, to, maxPoints = 2000 } = {}) {
  let sql = `SELECT price as price, ts as time FROM price_history WHERE crop_id = ?`;
  const args = [cropId];
  if (from) {
    sql += ` AND ts >= ?`;
    args.push(from);
  }
  if (to) {
    sql += ` AND ts <= ?`;
    args.push(to);
  }
  sql += ` ORDER BY ts ASC`;
  const rows = db.prepare(sql).all(...args);
  if (rows.length <= maxPoints) return rows;
  const step = Math.ceil(rows.length / maxPoints);
  const out = [];
  for (let i = 0; i < rows.length; i += step) out.push(rows[i]);
  const last = rows[rows.length - 1];
  if (out.length === 0 || out[out.length - 1].time !== last.time) out.push(last);
  return out;
}
