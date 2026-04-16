import { getCrop } from '../models/cropModel.js';
import { listWatchlist, addWatch, removeWatch } from '../models/watchlistModel.js';

export function getWatchlist(req, res) {
  try {
    res.json({ items: listWatchlist(req.userId) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function addToWatchlist(req, res) {
  try {
    const cropId = req.body?.cropId;
    if (!cropId) return res.status(400).json({ error: 'cropId required' });
    if (!getCrop(cropId)) return res.status(404).json({ error: 'Crop not found' });
    addWatch(req.userId, cropId);
    res.json({ ok: true, items: listWatchlist(req.userId) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function removeFromWatchlist(req, res) {
  try {
    const cropId = req.body?.cropId;
    if (!cropId) return res.status(400).json({ error: 'cropId required' });
    removeWatch(req.userId, cropId);
    res.json({ ok: true, items: listWatchlist(req.userId) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
