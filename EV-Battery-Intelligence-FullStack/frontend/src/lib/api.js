// Lightweight REST client — talks to the EV Battery Intelligence backend.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('ev_token');
}

async function request(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    // non-JSON response (e.g. CSV/PDF downloads) — caller handles res directly
  }

  if (res.status === 401 && getToken() && !endpoint.startsWith('/auth/')) {
    // Token is missing/invalid/expired — clear it and send the user back to
    // the login screen automatically instead of getting stuck on an error.
    localStorage.removeItem('ev_token');
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    throw new Error((json && json.message) || `Request failed (${res.status})`);
  }

  return json ? json.data : null;
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};

export function saveToken(token) {
  localStorage.setItem('ev_token', token);
}

export function clearToken() {
  localStorage.removeItem('ev_token');
}

export function getStoredToken() {
  return getToken();
}

export { API_URL };
