import { listCrops, getCrop } from '../models/cropModel.js';
import { getHistory } from '../services/priceEngine.js';

export function getCrops(req, res) {
  try {
    res.json({ crops: listCrops() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function getCropById(req, res) {
  try {
    const c = getCrop(req.params.id);
    if (!c) return res.status(404).json({ error: 'Crop not found' });
    res.json({ crop: c });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function getCropHistory(req, res) {
  try {
    const cropId = req.params.cropId;
    const c = getCrop(cropId);
    if (!c) return res.status(404).json({ error: 'Crop not found' });
    const limit = Math.min(500, Math.max(10, Number(req.query.limit) || 120));
    res.json({ cropId, history: getHistory(cropId, limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
