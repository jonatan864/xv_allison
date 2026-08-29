import { io } from 'socket.io-client';
import { getAuthToken } from './api.js';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || `${window.location.protocol}//${window.location.hostname}:4000`;

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
