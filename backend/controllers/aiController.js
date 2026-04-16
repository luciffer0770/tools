import { answerQuery } from '../services/aiService.js';

export function postAiQuery(req, res) {
  try {
    const message = (req.body?.message || '').toString().slice(0, 2000);
    const result = answerQuery({ userId: req.userId, message });
    res.json({ ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
