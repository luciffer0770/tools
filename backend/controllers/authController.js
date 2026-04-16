import { createUser, findUserByUsername, getUser } from '../models/userModel.js';

export function login(req, res) {
  try {
    const username = (req.body?.username || '').trim() || 'Trader';
    let user = findUserByUsername(username);
    if (!user) user = createUser(username);
    res.json({
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
        tutorialCompleted: !!user.tutorial_completed,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function me(req, res) {
  try {
    const user = getUser(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
        tutorialCompleted: !!user.tutorial_completed,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
