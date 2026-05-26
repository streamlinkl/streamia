// Server-side fetch wrapper for Next.js App Router (server components,
// route handlers, server actions). Forwards the user's auth cookies to the
// API. Mirrors the shape of the browser-side `src/lib/api.js` so call sites
// don't have to know which environment they're running in.
//
// Browser code keeps using `src/lib/api.js`; this file is the SSR twin.

import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message || `HTTP ${status}`)
    this.status = status
    this.code = code
    this.details = details
  }
}

async function request(method, path, { body, query } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${API_URL}${path}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue
      url.searchParams.set(k, String(v))
    }
  }

  // Forward the user's `sl_access` / `sl_refresh` cookies so the API sees
  // them as if the browser called directly. `cookies()` reads from the
  // incoming request in App Router.
  const ck = cookies()
  const cookieHeader = ck.getAll().map((c) => `${c.name}=${c.value}`).join('; ')

  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (cookieHeader) headers.Cookie = cookieHeader

  const res = await fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    // Never let Next.js cache authed responses across requests.
    cache: 'no-store',
  })

  if (res.status === 204) return null

  const text = await res.text()
  const data = text ? JSON.parse(text) : null
  if (!res.ok) {
    const err = data?.error ?? {}
    throw new ApiError(res.status, err.code || 'HTTP_ERROR', err.message || res.statusText, err.details)
  }
  return data
}

export const apiServer = {
  baseUrl: API_URL,
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
}

/**
 * Convenience: fetch the current user inside any server component.
 * Returns `null` when there's no session — page code can then redirect.
 */
export async function getMeServer() {
  try {
    return await apiServer.get('/api/auth/me')
  } catch (err) {
    if (err?.status === 401) return null
    throw err
  }
}
