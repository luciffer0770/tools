import { io } from 'socket.io-client';

const TOKEN_KEY = 'cropbank_token';

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function createGameSocket() {
  const url = import.meta.env.DEV ? window.location.origin : window.location.origin;
  const token = getStoredToken();
  return io(url, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    auth: token ? { token } : {},
  });
}
