import { db } from '../db/database.js';

export function listCrops() {
  return db
    .prepare(
      `SELECT id, name, current_price as currentPrice, base_price as basePrice,
              volatility_factor as volatilityFactor, demand_index as demandIndex, trend
       FROM crops ORDER BY name`
    )
    .all();
}

export function getCrop(id) {
  return db
    .prepare(
      `SELECT id, name, current_price as currentPrice, base_price as basePrice,
              volatility_factor as volatilityFactor, demand_index as demandIndex, trend
       FROM crops WHERE id = ?`
    )
    .get(id);
}
