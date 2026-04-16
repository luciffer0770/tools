import { computePortfolioMetrics } from '../services/portfolioAnalytics.js';
import { listTransactions, listSnapshots } from '../models/portfolioModel.js';
import { listAchievements } from '../models/achievementModel.js';

export function getPortfolio(req, res) {
  try {
    const userId = req.userId;
    const metrics = computePortfolioMetrics(userId);
    const transactions = listTransactions(userId, 100);
    const history = listSnapshots(userId, 200);
    const achievements = listAchievements(userId);
    res.json({
      ...metrics,
      transactions,
      portfolioHistory: history,
      achievements,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
