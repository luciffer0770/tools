const API = '/api';

function headers(userId) {
  const h = { 'Content-Type': 'application/json' };
  if (userId) h['X-User-Id'] = userId;
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

export async function apiLogin(username) {
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ username }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function apiMe(userId) {
  const res = await fetch(`${API}/me`, { headers: headers(userId) });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Auth failed');
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

export async function apiPortfolio(userId) {
  const res = await fetch(`${API}/portfolio`, { headers: headers(userId) });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Failed to load portfolio');
  return data;
}

export async function apiBuy(userId, cropId, quantity) {
  const res = await fetch(`${API}/buy`, {
    method: 'POST',
    headers: headers(userId),
    body: JSON.stringify({ cropId, quantity }),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Buy failed');
  return data;
}

export async function apiSell(userId, cropId, quantity) {
  const res = await fetch(`${API}/sell`, {
    method: 'POST',
    headers: headers(userId),
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

export async function apiTutorialStart(userId) {
  const res = await fetch(`${API}/tutorial/start`, {
    method: 'POST',
    headers: headers(userId),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Tutorial start failed');
  return data;
}

export async function apiTutorialComplete(userId) {
  const res = await fetch(`${API}/tutorial/complete`, {
    method: 'POST',
    headers: headers(userId),
  });
  const data = await parse(res);
  if (!res.ok) throw new Error(data.error || 'Tutorial complete failed');
  return data;
}
