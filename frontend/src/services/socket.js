import { io } from 'socket.io-client';

const TOKEN_KEY = 'cropbank_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function socketOrigin() {
  const base = (import.meta.env.VITE_API_URL || '').trim();
  if (base.startsWith('http')) {
    try {
      const u = new URL(base.replace(/\/api\/?$/, '/'));
      return `${u.protocol}//${u.host}`;
    } catch {
      /* fall through */
    }
  }
  return window.location.origin;
}

export function createGameSocket() {
  const url = socketOrigin();
  const token = getStoredToken();
  return io(url, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: token ? { token } : {},
  });
}
