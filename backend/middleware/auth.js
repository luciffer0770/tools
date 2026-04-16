import { verifyToken } from '../services/jwtService.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing or invalid authorization' });
  const payload = verifyToken(token);
  if (!payload?.sub) return res.status(401).json({ error: 'Invalid or expired token' });
  req.userId = payload.sub;
  next();
}
