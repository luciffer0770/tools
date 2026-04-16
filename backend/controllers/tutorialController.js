import { getUser, setTutorialBalance, completeTutorial } from '../models/userModel.js';

export function startTutorial(req, res) {
  try {
    const user = getUser(req.userId);
    if (user.tutorial_completed) {
      return res.status(400).json({ error: 'Tutorial already completed' });
    }
    setTutorialBalance(req.userId);
    res.json({
      user: {
        id: user.id,
        username: user.username,
        balance: 100,
        tutorialCompleted: false,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function finishTutorial(req, res) {
  try {
    const user = getUser(req.userId);
    if (user.tutorial_completed) {
      return res.json({
        user: {
          id: user.id,
          username: user.username,
          balance: user.balance,
          tutorialCompleted: true,
        },
      });
    }
    completeTutorial(req.userId);
    const updated = getUser(req.userId);
    res.json({
      user: {
        id: updated.id,
        username: updated.username,
        balance: updated.balance,
        tutorialCompleted: true,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
