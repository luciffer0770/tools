export function requireUser(req, res, next) {
  const id = req.headers['x-user-id'];
  if (!id) return res.status(401).json({ error: 'Missing X-User-Id header' });
  req.userId = id;
  next();
}
