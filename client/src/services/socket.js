import { io } from 'socket.io-client';
import { getAuthToken } from './api.js';

const LOCAL_SOCKET_URL = `${window.location.protocol}//${window.location.hostname}:4000`;
const PRODUCTION_SOCKET_URL = 'https://xv-allison.onrender.com';

// Vite inyecta VITE_SOCKET_URL durante el build. Si no existe, producción usa
// directamente Socket.IO del backend de Render y desarrollo conserva la URL local.
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.PROD ? PRODUCTION_SOCKET_URL : LOCAL_SOCKET_URL);

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      auth: () => ({ token: getAuthToken() })
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) socket.disconnect();
}
