import { buildResearchReport } from '../services/researchService.js';

export function getResearch(req, res) {
  try {
    res.json(buildResearchReport());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
