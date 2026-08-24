import { useEffect, useState } from 'react';
import { getAuthToken } from '../services/api.js';
import { getMe, login as loginService, logout as logoutService } from '../services/authService.js';

export function useAuth() {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(Boolean(getAuthToken()));
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getAuthToken()) return;

    getMe()
      .then(setUsuario)
      .catch(() => logoutService())
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    setError('');
    const user = await loginService(email, password);
    setUsuario(user);
  }

  function logout() {
    logoutService();
    setUsuario(null);
  }

  return {
    usuario,
    loading,
    error,
    setError,
    login,
    logout,
    isAdmin: usuario?.rol === 'ADMIN',
    isAccess: usuario?.rol === 'ACCESO'
  };
}
