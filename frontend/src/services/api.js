const API = '/api';

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

export async function apiRegister({ email, password, username }) {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password, username }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function apiLogin({ email, password }) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function apiMe(token) {
  const res = await fetch(`${API}/me`, { headers: authHeaders(token) });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Session expired');
  return data;
}

export async function apiCrops() {
  const res = await fetch(`${API}/crops`);
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Failed to load crops');
  return data;
}

export async function apiCrop(id) {
  const res = await fetch(`${API}/crops/${id}`);
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Failed to load crop');
  return data;
}

export async function apiHistory(cropId, limit) {
  const q = limit ? `?limit=${limit}` : '';
  const res = await fetch(`${API}/history/${cropId}${q}`);
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Failed to load history');
  return data;
}

export async function apiPortfolio(token) {
  const res = await fetch(`${API}/portfolio`, { headers: authHeaders(token) });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Failed to load portfolio');
  return data;
}

export async function apiBuy(token, cropId, quantity) {
  const res = await fetch(`${API}/buy`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ cropId, quantity }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Buy failed');
  return data;
}

export async function apiSell(token, cropId, quantity) {
  const res = await fetch(`${API}/sell`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ cropId, quantity }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Sell failed');
  return data;
}

export async function apiNews(limit) {
  const q = limit ? `?limit=${limit}` : '';
  const res = await fetch(`${API}/news${q}`);
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Failed to load news');
  return data;
}

export async function apiWatchlist(token) {
  const res = await fetch(`${API}/watchlist`, { headers: authHeaders(token) });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Watchlist failed');
  return data;
}

export async function apiWatchlistAdd(token, cropId) {
  const res = await fetch(`${API}/watchlist/add`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ cropId }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Add failed');
  return data;
}

export async function apiWatchlistRemove(token, cropId) {
  const res = await fetch(`${API}/watchlist/remove`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ cropId }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Remove failed');
  return data;
}

export async function apiResearch() {
  const res = await fetch(`${API}/research`);
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Research failed');
  return data;
}

export async function apiAiQuery(token, message) {
  const res = await fetch(`${API}/ai/query`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ message }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'AI request failed');
  return data;
}

export async function apiPatchSettings(token, partial) {
  const res = await fetch(`${API}/settings`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(partial),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Settings update failed');
  return data;
}

export async function apiResetGame(token) {
  const res = await fetch(`${API}/settings/reset-game`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Reset failed');
  return data;
}

export async function apiDailyReward(token) {
  const res = await fetch(`${API}/settings/daily-reward`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Reward failed');
  return data;
}

export async function apiTutorialStart(token) {
  const res = await fetch(`${API}/tutorial/start`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Tutorial start failed');
  return data;
}

export async function apiTutorialComplete(token) {
  const res = await fetch(`${API}/tutorial/complete`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Tutorial complete failed');
  return data;
}

export async function apiTutorialSkip(token) {
  const res = await fetch(`${API}/tutorial/skip`, {
    method: 'POST',
    headers: authHeaders(token),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Skip failed');
  return data;
}

export async function apiTutorialStep(token, step) {
  const res = await fetch(`${API}/tutorial/step`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ step }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Step update failed');
  return data;
}
