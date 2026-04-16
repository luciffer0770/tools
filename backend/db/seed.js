import { v4 as uuid } from 'uuid';
import { db } from './database.js';

const SAMPLE_CROPS = [
  { name: 'Solar Wheat', base: 12.5, vol: 0.35, demand: 0.4, trend: 0.02 },
  { name: 'Neon Corn', base: 8.2, vol: 0.55, demand: -0.1, trend: -0.01 },
  { name: 'Quantum Rice', base: 22.0, vol: 0.28, demand: 0.6, trend: 0.015 },
  { name: 'Bio Barley', base: 15.75, vol: 0.42, demand: 0.2, trend: 0.005 },
  { name: 'Plasma Soy', base: 18.3, vol: 0.5, demand: -0.25, trend: -0.02 },
  { name: 'Cryo Cotton', base: 9.9, vol: 0.38, demand: 0.15, trend: 0.01 },
  { name: 'Hydro Hemp', base: 31.4, vol: 0.62, demand: 0.5, trend: 0.03 },
  { name: 'Ion Potato', base: 6.4, vol: 0.33, demand: 0.05, trend: 0 },
];

export function seedCropsIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM crops').get().c;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO crops (id, name, base_price, current_price, volatility_factor, demand_index, trend)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction(() => {
    for (const c of SAMPLE_CROPS) {
      const id = uuid();
      insert.run(
        id,
        c.name,
        c.base,
        c.base,
        c.vol,
        c.demand,
        c.trend
      );
    }
  });
  insertMany();
}
