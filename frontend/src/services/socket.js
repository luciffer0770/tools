import { io } from 'socket.io-client';

export function createGameSocket() {
  const url = import.meta.env.DEV ? window.location.origin : window.location.origin;
  return io(url, { path: '/socket.io', transports: ['websocket', 'polling'] });
}
