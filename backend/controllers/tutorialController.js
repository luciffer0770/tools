import {
  getUser,
  setTutorialBalance,
  completeTutorial,
  setTutorialStep,
  toPublicUser,
} from '../models/userModel.js';

export function startTutorial(req, res) {
  try {
    const user = getUser(req.userId);
    if (user.tutorial_completed) {
      return res.status(400).json({ error: 'Tutorial already completed' });
    }
    setTutorialBalance(req.userId);
    res.json({ user: toPublicUser(getUser(req.userId)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function finishTutorial(req, res) {
  try {
    const user = getUser(req.userId);
    if (user.tutorial_completed) {
      return res.json({ user: toPublicUser(user) });
    }
    completeTutorial(req.userId);
    res.json({ user: toPublicUser(getUser(req.userId)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function skipTutorial(req, res) {
  try {
    const user = getUser(req.userId);
    if (user.tutorial_completed) {
      return res.json({ user: toPublicUser(user) });
    }
    completeTutorial(req.userId);
    res.json({ user: toPublicUser(getUser(req.userId)), skipped: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function updateTutorialStep(req, res) {
  try {
    const step = Math.floor(Number(req.body?.step));
    if (!Number.isFinite(step) || step < 0 || step > 20) {
      return res.status(400).json({ error: 'Invalid step' });
    }
    const user = getUser(req.userId);
    if (user.tutorial_completed) {
      return res.json({ user: toPublicUser(user) });
    }
    setTutorialStep(req.userId, step);
    res.json({ user: toPublicUser(getUser(req.userId)) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
