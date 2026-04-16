import { listNews } from '../services/newsEngine.js';

export function getNews(req, res) {
  try {
    const limit = Math.min(100, Math.max(5, Number(req.query.limit) || 40));
    res.json({ news: listNews(limit) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
