const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

export async function signup(email, password) {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function saveKeys(apiKey, secretKey, token) {
  const res = await fetch(`${BASE}/keys/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ apiKey, secretKey })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function removeKeys(token) {
  const res = await fetch(`${BASE}/keys/remove`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function fetchCandles(symbol, interval = '1h', limit = 150) {
  const res = await fetch(`${BASE}/market/candles?symbol=${symbol}&interval=${interval}&limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch candles');
  return res.json();
}

export async function fetchTicker(symbol) {
  const res = await fetch(`${BASE}/market/ticker?symbol=${symbol}`);
  if (!res.ok) throw new Error('Failed to fetch ticker');
  return res.json();
}

function authHeaders(token) {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

export async function fetchBalances(token) {
  const res = await fetch(`${BASE}/orders/balances`, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function placeOrder({ symbol, side, type, quantity, price }, token) {
  const res = await fetch(`${BASE}/orders/place`, {
    method: 'POST', headers: authHeaders(token),
    body: JSON.stringify({ symbol, side, type, quantity, price })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function testOrder({ symbol, side, type, quantity, price }, token) {
  const res = await fetch(`${BASE}/orders/test`, {
    method: 'POST', headers: authHeaders(token),
    body: JSON.stringify({ symbol, side, type, quantity, price })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function fetchOpenOrders(symbol, token) {
  const res = await fetch(`${BASE}/orders/open?symbol=${symbol}`, { headers: authHeaders(token) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

export async function cancelOrder(symbol, orderId, token) {
  const res = await fetch(`${BASE}/orders/cancel?symbol=${symbol}&orderId=${orderId}`, {
    method: 'DELETE', headers: authHeaders(token)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}