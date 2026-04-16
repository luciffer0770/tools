import { db } from '../db/database.js';
import { v4 as uuid } from 'uuid';

const HEADLINES = [
  'Drought scanners report yield stress in',
  'Export corridor opens for',
  'Bio-lab breakthrough boosts',
  'Orbital irrigation malfunctions hit',
  'Retail hoarding wave targets',
  'Carbon credit windfall for',
  'Pest swarm detected near',
  'Government subsidy approved for',
];

const BODIES = [
  'Traders are repositioning as volatility climbs.',
  'Supply chains are adjusting to the new narrative.',
  'Analysts expect a short-lived shock before mean reversion.',
  'Farm futures desks report elevated order flow.',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDuration() {
  return 25 + Math.floor(Math.random() * 80);
}

export function decayImpact(initial, elapsedSec, durationSec, decayRate) {
  if (elapsedSec >= durationSec) return 0;
  const life = 1 - elapsedSec / durationSec;
  return initial * life * decayRate;
}

export function spawnNewsEvent() {
  const crops = db.prepare('SELECT id, name FROM crops').all();
  if (!crops.length) return null;

  const n = 1 + Math.floor(Math.random() * 3);
  const picks = [];
  const used = new Set();
  while (picks.length < n && used.size < crops.length) {
    const c = crops[Math.floor(Math.random() * crops.length)];
    if (!used.has(c.id)) {
      used.add(c.id);
      picks.push(c);
    }
  }

  const eventId = uuid();
  const now = Date.now();
  const durationSec = randomDuration();
  const decayRate = 0.65 + Math.random() * 0.3;
  const startedAt = new Date(now).toISOString();
  const expiresAt = new Date(now + durationSec * 1000).toISOString();
  const headlineBase = pick(HEADLINES);
  const names = picks.map((p) => p.name).join(', ');
  const headline = `${headlineBase} ${names}`;
  const body = pick(BODIES);

  const insertEvent = db.prepare(`
    INSERT INTO news_events (id, headline, body, started_at, duration_sec, decay_rate, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const insertEffect = db.prepare(`
    INSERT INTO news_crop_effects (event_id, crop_id, initial_impact)
    VALUES (?, ?, ?)
  `);

  const tx = db.transaction(() => {
    insertEvent.run(
      eventId,
      headline,
      body,
      startedAt,
      durationSec,
      decayRate,
      expiresAt
    );
    for (const p of picks) {
      const magnitude = 0.4 + Math.random() * 1.8;
      const sign = Math.random() > 0.45 ? 1 : -1;
      insertEffect.run(eventId, p.id, sign * magnitude);
    }
  });
  tx();

  return getNewsById(eventId);
}

export function getActiveNewsImpacts() {
  const now = Date.now();
  const isoNow = new Date(now).toISOString();
  const rows = db
    .prepare(
      `
    SELECT e.id, e.started_at, e.duration_sec, e.decay_rate, c.crop_id, c.initial_impact
    FROM news_events e
    JOIN news_crop_effects c ON c.event_id = e.id
    WHERE e.expires_at > ?
  `
    )
    .all(isoNow);

  const map = {};
  for (const r of rows) {
    const start = new Date(r.started_at).getTime();
    const elapsedSec = (now - start) / 1000;
    const impact = decayImpact(
      r.initial_impact,
      elapsedSec,
      r.duration_sec,
      r.decay_rate
    );
    map[r.crop_id] = (map[r.crop_id] || 0) + impact;
  }
  return map;
}

export function listNews(limit = 40) {
  return db
    .prepare(
      `
    SELECT e.id, e.headline, e.body, e.started_at, e.duration_sec, e.expires_at,
           GROUP_CONCAT(c.crop_id) as crop_ids,
           GROUP_CONCAT(c.initial_impact) as impacts
    FROM news_events e
    LEFT JOIN news_crop_effects c ON c.event_id = e.id
    GROUP BY e.id
    ORDER BY e.started_at DESC
    LIMIT ?
  `
    )
    .all(limit)
    .map(formatNewsRow);
}

function formatNewsRow(r) {
  const cropIds = r.crop_ids ? r.crop_ids.split(',') : [];
  const impacts = r.impacts ? r.impacts.split(',').map(Number) : [];
  const effects = cropIds.map((id, i) => ({
    cropId: id,
    initialImpact: impacts[i] || 0,
  }));
  return {
    id: r.id,
    headline: r.headline,
    body: r.body,
    startedAt: r.started_at,
    durationSec: r.duration_sec,
    expiresAt: r.expires_at,
    effects,
  };
}

function getNewsById(id) {
  const r = db
    .prepare(
      `
    SELECT e.id, e.headline, e.body, e.started_at, e.duration_sec, e.expires_at,
           GROUP_CONCAT(c.crop_id) as crop_ids,
           GROUP_CONCAT(c.initial_impact) as impacts
    FROM news_events e
    LEFT JOIN news_crop_effects c ON c.event_id = e.id
    WHERE e.id = ?
    GROUP BY e.id
  `
    )
    .get(id);
  return r ? formatNewsRow(r) : null;
}

export function pruneExpiredNews() {
  const isoNow = new Date().toISOString();
  db.prepare(`DELETE FROM news_events WHERE expires_at <= ?`).run(isoNow);
}
