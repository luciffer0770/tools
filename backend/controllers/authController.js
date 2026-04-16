import {
  createUser,
  findUserByEmail,
  getUser,
  verifyPassword,
  toPublicUser,
} from '../models/userModel.js';
import { signToken } from '../services/jwtService.js';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
}

export function register(req, res) {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    const password = req.body?.password || '';
    const username = (req.body?.username || '').trim();

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (findUserByEmail(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = createUser({ email, password, username: username || undefined });
    const token = signToken({ sub: user.id, email: user.email });
    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function login(req, res) {
  try {
    const email = (req.body?.email || '').trim().toLowerCase();
    const password = req.body?.password || '';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = findUserByEmail(email);
    if (!user || !verifyPassword(user, password)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ sub: user.id, email: user.email });
    res.json({ token, user: toPublicUser(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export function me(req, res) {
  try {
    const user = getUser(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: toPublicUser(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
