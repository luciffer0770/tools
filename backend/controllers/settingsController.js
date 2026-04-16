import { getUser, updateSettings, resetGame, toPublicUser, claimDailyReward } from '../models/userModel.js';

export function getSettings(req, res) {
  try {
    const user = getUser(req.userId);
    if (!user) return res.status(404).json({ error: 'Not found' });
    res.json({ user: toPublicUser(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function patchSettings(req, res) {
  try {
    const { theme, soundEnabled, notificationsEnabled } = req.body || {};
    const partial = {};
    if (theme === 'dark' || theme === 'light') partial.theme = theme;
    if (typeof soundEnabled === 'boolean') partial.soundEnabled = soundEnabled;
    if (typeof notificationsEnabled === 'boolean') {
      partial.notificationsEnabled = notificationsEnabled;
    }
    updateSettings(req.userId, partial);
    const user = getUser(req.userId);
    res.json({ user: toPublicUser(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function postResetGame(req, res) {
  try {
    resetGame(req.userId);
    const user = getUser(req.userId);
    res.json({ user: toPublicUser(user), message: 'Game reset — fresh $1000 and cleared positions.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function postDailyReward(req, res) {
  try {
    const result = claimDailyReward(req.userId);
    const user = getUser(req.userId);
    res.json({ ...result, user: toPublicUser(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
