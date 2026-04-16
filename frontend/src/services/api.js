/**
 * API base path. Default `/api` uses Vite dev proxy.
 * If guest/login fails with 404, set in `.env.local`:
 *   VITE_API_URL=http://localhost:4000/api
 * (point at your running backend; no trailing slash)
 */
const envBase = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
const API_PREFIX = envBase || '/api';

function apiPath(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (API_PREFIX.startsWith('http')) return `${API_PREFIX}${p}`;
  return `${API_PREFIX}${p}`;
}

function authHeaders(token) {
  const h = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function parse(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function httpError(res, data, fallback) {
  if (res.status === 404) {
    return (
      data.error ||
      'API route not found. Restart the backend (npm run dev in /backend) or set VITE_API_URL=http://localhost:4000/api in frontend/.env.local'
    );
  }
  return data.error || fallback || `Request failed (${res.status})`;
}

export async function apiRegister({ email, password, username }) {
  const res = await fetch(apiPath('/auth/register'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password, username }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Registration failed'));
  return data;
}

export async function apiLogin({ email, password }) {
  const res = await fetch(apiPath('/auth/login'), {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Login failed'));
  return data;
}

export async function apiGuest() {
  const res = await fetch(apiPath('/auth/guest'), {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Guest session failed'));
  return data;
}

export async function apiMe(token) {
  const res = await fetch(apiPath('/me'), { headers: authHeaders(token) });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Session expired'));
  return data;
}

export async function apiCrops() {
  const res = await fetch(apiPath('/crops'));
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Failed to load crops'));
  return data;
}

export async function apiCrop(id) {
  const res = await fetch(apiPath(`/crops/${id}`));
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Failed to load crop'));
  return data;
}

export async function apiHistory(cropId, opts = {}) {
  const params = new URLSearchParams();
  if (opts.from) params.set('from', opts.from);
  if (opts.to) params.set('to', opts.to);
  if (opts.maxPoints) params.set('maxPoints', String(opts.maxPoints));
  if (opts.limit && !opts.from) params.set('limit', String(opts.limit));
  const qs = params.toString();
  const q = qs ? `?${qs}` : '';
  const res = await fetch(apiPath(`/history/${cropId}${q}`));
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Failed to load history'));
  return data;
}

export async function apiPortfolio(token) {
  const res = await fetch(apiPath('/portfolio'), { headers: authHeaders(token) });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Failed to load portfolio'));
  return data;
}

export async function apiBuy(token, cropId, quantity) {
  const res = await fetch(apiPath('/buy'), {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ cropId, quantity }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Buy failed'));
  return data;
}

export async function apiSell(token, cropId, quantity) {
  const res = await fetch(apiPath('/sell'), {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ cropId, quantity }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Sell failed'));
  return data;
}

export async function apiNews(limit) {
  const q = limit ? `?limit=${limit}` : '';
  const res = await fetch(apiPath(`/news${q}`));
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Failed to load news'));
  return data;
}

export async function apiWatchlist(token) {
  const res = await fetch(apiPath('/watchlist'), { headers: authHeaders(token) });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Watchlist failed'));
  return data;
}

export async function apiWatchlistAdd(token, cropId) {
  const res = await fetch(apiPath('/watchlist/add'), {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ cropId }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Add failed'));
  return data;
}

export async function apiWatchlistRemove(token, cropId) {
  const res = await fetch(apiPath('/watchlist/remove'), {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ cropId }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Remove failed'));
  return data;
}

export async function apiResearch() {
  const res = await fetch(apiPath('/research'));
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Research failed'));
  return data;
}

export async function apiAiQuery(token, message) {
  const res = await fetch(apiPath('/ai/query'), {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ message }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'AI request failed'));
  return data;
}

export async function apiPatchSettings(token, partial) {
  const res = await fetch(apiPath('/settings'), {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(partial),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Settings update failed'));
  return data;
}

export async function apiResetGame(token) {
  const res = await fetch(apiPath('/settings/reset-game'), {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Reset failed'));
  return data;
}

export async function apiDailyReward(token) {
  const res = await fetch(apiPath('/settings/daily-reward'), {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Reward failed'));
  return data;
}

export async function apiTutorialStart(token) {
  const res = await fetch(apiPath('/tutorial/start'), {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Tutorial start failed'));
  return data;
}

export async function apiTutorialComplete(token) {
  const res = await fetch(apiPath('/tutorial/complete'), {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Tutorial complete failed'));
  return data;
}

export async function apiTutorialSkip(token) {
  const res = await fetch(apiPath('/tutorial/skip'), {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Skip failed'));
  return data;
}

export async function apiTutorialStep(token, step) {
  const res = await fetch(apiPath('/tutorial/step'), {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ step }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(httpError(res, data, 'Step update failed'));
  return data;
}
