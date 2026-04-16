import { Router } from 'express';
import { login, me } from '../controllers/authController.js';
import { getCrops, getCropById, getCropHistory } from '../controllers/cropController.js';
import { buy, sell, getPortfolio } from '../controllers/tradeController.js';
import { getNews } from '../controllers/newsController.js';
import { startTutorial, finishTutorial } from '../controllers/tutorialController.js';
import { requireUser } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.get('/me', requireUser, me);

router.get('/crops', getCrops);
router.get('/crops/:id', getCropById);
router.get('/history/:cropId', getCropHistory);

router.get('/portfolio', requireUser, getPortfolio);
router.post('/buy', requireUser, buy);
router.post('/sell', requireUser, sell);

router.get('/news', getNews);

router.post('/tutorial/start', requireUser, startTutorial);
router.post('/tutorial/complete', requireUser, finishTutorial);

export default router;
