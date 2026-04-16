import { v4 as uuid } from 'uuid';
import { db } from './database.js';
import { CROP_CATALOG } from './cropCatalog.js';

export function seedCropsIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) as c FROM crops').get().c;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO crops (id, name, base_price, current_price, volatility_factor, demand_index, trend)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction(() => {
    for (const c of CROP_CATALOG) {
      const id = uuid();
      insert.run(id, c.name, c.base, c.base, c.vol, c.demand, c.trend);
    }
  });
  insertMany();
}
