import { io } from 'socket.io-client';
import { getStoredToken } from './api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socketInstance = null;

// Creates (or reuses) a single Socket.io connection authenticated with the current JWT.
export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      auth: { token: getStoredToken() },
      autoConnect: false,
    });
  }
  return socketInstance;
}

export function connectSocket() {
  const socket = getSocket();
  // Refresh auth token in case it changed since the socket was created
  socket.auth = { token: getStoredToken() };
  if (!socket.connected) socket.connect();
  return socket;
}

export function disconnectSocket() {
  if (socketInstance && socketInstance.connected) {
    socketInstance.disconnect();
  }
}
