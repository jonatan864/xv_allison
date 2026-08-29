const API_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:4000/api`;

let authToken = sessionStorage.getItem('xv_auth_token') || '';

export function setAuthToken(token) {
  authToken = token || '';
  if (authToken) {
    sessionStorage.setItem('xv_auth_token', authToken);
  } else {
    sessionStorage.removeItem('xv_auth_token');
  }
}

export function getAuthToken() {
  return authToken;
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Error de conexion con el servidor');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
