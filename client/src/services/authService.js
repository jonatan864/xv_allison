import { apiRequest, setAuthToken } from './api.js';

export async function login(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  setAuthToken(data.token);
  return data.usuario;
}

export async function getMe() {
  const data = await apiRequest('/auth/me');
  return data.usuario;
}

export function logout() {
  setAuthToken('');
}
