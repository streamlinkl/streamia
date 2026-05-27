'use client'
import { io } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://api.streamia.co'

let socket = null

/**
 * Lazily create the socket. Auth flows via the sl_access httpOnly cookie —
 * with `withCredentials: true` the browser attaches it to the handshake and
 * the server reads it from `socket.handshake.headers.cookie`.
 */
export function getSocket() {
  if (typeof window === 'undefined') return null
  if (socket) return socket

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect_error', (err) => {
    // eslint-disable-next-line no-console
    console.warn('[socket] connect_error:', err.message)
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function reconnectSocket() {
  disconnectSocket()
  return getSocket()
}
