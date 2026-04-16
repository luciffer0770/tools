import { db } from '../db/database.js';

const META_KEY = 'price_history_daily_v1';

function getMeta(key) {
  const r = db.prepare('SELECT value FROM app_meta WHERE key = ?').get(key);
  return r?.value ?? null;
}

function setMeta(key, value) {
  db.prepare('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)').run(key, value);
}

function strHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** YYYY-MM-DD at 12:00 UTC */
function noonIso(ymd) {
  return `${ymd}T12:00:00.000Z`;
}

function addDays(ymd, delta) {
  const d = new Date(`${ymd}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * One-time synthetic daily prices from 2020-01-01 through yesterday (UTC),
 * then a row at "now" with each crop's current_price.
 */
export function backfillDailyHistoryIfNeeded() {
  if (getMeta(META_KEY) === '1') return { ran: false };

  const crops = db.prepare('SELECT id, base_price, current_price, volatility_factor FROM crops').all();
  if (!crops.length) return { ran: false };

  const start = '2020-01-01';
  const today = new Date();
  const y = today.getUTCFullYear();
  const m = String(today.getUTCMonth() + 1).padStart(2, '0');
  const d = String(today.getUTCDate()).padStart(2, '0');
  const todayYmd = `${y}-${m}-${d}`;

  let end = addDays(todayYmd, -1);
  if (end < start) end = start;

  const del = db.prepare('DELETE FROM price_history');
  const ins = db.prepare('INSERT INTO price_history (crop_id, price, ts) VALUES (?, ?, ?)');

  const tx = db.transaction(() => {
    del.run();
    for (const crop of crops) {
      let price = crop.base_price;
      let ymd = start;
      while (ymd <= end) {
        const h = strHash(`${crop.id}|${ymd}`);
        const u = (h % 10000) / 10000;
        const dailyReturn = (u - 0.5) * 0.028 * (crop.volatility_factor || 0.4);
        const drift = 0.00012 * (crop.volatility_factor || 0.4);
        price = price * (1 + dailyReturn + drift);
        const lo = crop.base_price * 0.35;
        const hi = crop.base_price * 4.5;
        price = Math.max(lo, Math.min(hi, price));
        price = Math.round(price * 100) / 100;
        ins.run(crop.id, price, noonIso(ymd));
        ymd = addDays(ymd, 1);
      }
      const nowIso = new Date().toISOString();
      ins.run(crop.id, crop.current_price, nowIso);
    }
    setMeta(META_KEY, '1');
  });
  tx();

  return { ran: true, crops: crops.length };
}

export function isHistoryBackfilled() {
  return getMeta(META_KEY) === '1';
}
