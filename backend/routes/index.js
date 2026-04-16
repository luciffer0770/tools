import { Router } from 'express';
import { register, login, me } from '../controllers/authController.js';
import { getCrops, getCropById, getCropHistory } from '../controllers/cropController.js';
import { buy, sell } from '../controllers/tradeController.js';
import { getPortfolio } from '../controllers/portfolioController.js';
import { getNews } from '../controllers/newsController.js';
import {
  startTutorial,
  finishTutorial,
  skipTutorial,
  updateTutorialStep,
} from '../controllers/tutorialController.js';
import { requireAuth } from '../middleware/auth.js';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from '../controllers/watchlistController.js';
import { getResearch } from '../controllers/researchController.js';
import { postAiQuery } from '../controllers/aiController.js';
import {
  getSettings,
  patchSettings,
  postResetGame,
  postDailyReward,
} from '../controllers/settingsController.js';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/me', requireAuth, me);

router.get('/crops', getCrops);
router.get('/crops/:id', getCropById);
router.get('/history/:cropId', getCropHistory);

router.get('/portfolio', requireAuth, getPortfolio);
router.post('/buy', requireAuth, buy);
router.post('/sell', requireAuth, sell);

router.get('/watchlist', requireAuth, getWatchlist);
router.post('/watchlist/add', requireAuth, addToWatchlist);
router.post('/watchlist/remove', requireAuth, removeFromWatchlist);

router.get('/research', getResearch);
router.post('/ai/query', requireAuth, postAiQuery);

router.get('/settings', requireAuth, getSettings);
router.patch('/settings', requireAuth, patchSettings);
router.post('/settings/reset-game', requireAuth, postResetGame);
router.post('/settings/daily-reward', requireAuth, postDailyReward);

router.get('/news', getNews);

router.post('/tutorial/start', requireAuth, startTutorial);
router.post('/tutorial/complete', requireAuth, finishTutorial);
router.post('/tutorial/skip', requireAuth, skipTutorial);
router.post('/tutorial/step', requireAuth, updateTutorialStep);

export default router;
