import { io as ioClient, Socket } from "socket.io-client";
import Cookies from "js-cookie";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4889";

/**
 * Get authentication token for Socket.IO
 * Retrieves JWT token from cookies
 */
function getAuthToken(): string | undefined {
  // Try to get token from cookie (set by server)
  return Cookies.get('token') || Cookies.get('authToken');
}

/**
 * Create Socket.IO client with authentication
 * Token is sent on connection for server-side verification
 */
function createSocket(): Socket {
  const token = getAuthToken();

  return ioClient(SOCKET_URL, {
    withCredentials: true,
    autoConnect: false, // Manual connection after auth check
    auth: {
      token // Send JWT token for authentication
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });
}

export const socket = createSocket();

/**
 * Connect socket with authentication
 * Call this after user logs in
 */
export function connectSocket() {
  const token = getAuthToken();

  if (!token) {
    console.warn('[Socket.IO] No auth token available, skipping connection');
    return;
  }

  // Update auth token before connecting
  socket.auth = { token };

  if (!socket.connected) {
    socket.connect();
  }
}

/**
 * Disconnect socket
 * Call this when user logs out
 */
export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}

/**
 * Reconnect socket with new token
 * Useful after token refresh
 */
export function reconnectSocket() {
  disconnectSocket();
  connectSocket();
}

// Handle connection errors
socket.on('connect_error', (error) => {
  console.error('[Socket.IO] Connection error:', error.message);

  // If authentication failed, disconnect
  if (error.message.includes('Authentication')) {
    disconnectSocket();
  }
});

socket.on('error', (error) => {
  console.error('[Socket.IO] Socket error:', error);
});
