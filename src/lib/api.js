// HTTP client for streamia API with access/refresh token handling.
// All page code should import from here — no direct fetch calls elsewhere.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const STORAGE_KEYS = {
  access: 'sl_access',
  refresh: 'sl_refresh',
}

export const tokens = {
  getAccess: () => localStorage.getItem(STORAGE_KEYS.access),
  getRefresh: () => localStorage.getItem(STORAGE_KEYS.refresh),
  set: ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem(STORAGE_KEYS.access, accessToken)
    if (refreshToken) localStorage.setItem(STORAGE_KEYS.refresh, refreshToken)
  },
  clear: () => {
    localStorage.removeItem(STORAGE_KEYS.access)
    localStorage.removeItem(STORAGE_KEYS.refresh)
  },
}

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message || `HTTP ${status}`)
    this.status = status
    this.code = code
    this.details = details
  }
}

let refreshInFlight = null

async function doRefresh() {
  // Two acceptable sources for the refresh token: localStorage (legacy Bearer
  // clients) or the `sl_refresh` httpOnly cookie sent automatically. If we have
  // neither, the request will still try the cookie path and bubble up 401.
  const refreshToken = tokens.getRefresh()

  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(refreshToken ? { refreshToken } : {}),
  })
  if (!res.ok) {
    tokens.clear()
    throw new ApiError(res.status, 'REFRESH_FAILED', 'Session expired')
  }
  const data = await res.json()
  tokens.set(data)
  return data.accessToken
}

function getQueuedRefresh() {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null
    })
  }
  return refreshInFlight
}

async function request(method, path, { body, query, auth = true, retry = true } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${API_URL}${path}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue
      url.searchParams.set(k, String(v))
    }
  }

  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const access = tokens.getAccess()
    if (access) headers.Authorization = `Bearer ${access}`
  }

  const res = await fetch(url, {
    method,
    headers,
    // Include the httpOnly auth cookies on every same-site request to api.streamia.co.
    // Server sets `sl_access` / `sl_refresh`; we still send the Bearer header above for
    // backward compat until all clients are cookie-only.
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  // Refresh path: if we got a 401 AUTH_INVALID, try refresh once then retry
  if (res.status === 401 && auth && retry) {
    try {
      await getQueuedRefresh()
      return request(method, path, { body, query, auth, retry: false })
    } catch {
      tokens.clear()
      // fall through to throw below
    }
  }

  if (res.status === 204) return null

  const text = await res.text()
  const data = text ? JSON.parse(text) : null

  if (!res.ok) {
    const err = data?.error ?? {}
    throw new ApiError(res.status, err.code || 'HTTP_ERROR', err.message || res.statusText, err.details)
  }
  return data
}

export const api = {
  baseUrl: API_URL,
  get: (path, opts) => request('GET', path, opts),
  post: (path, body, opts) => request('POST', path, { ...opts, body }),
  patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
  put: (path, body, opts) => request('PUT', path, { ...opts, body }),
  delete: (path, opts) => request('DELETE', path, opts),
}

// ─────────── Endpoint shortcuts (documentation + typing hint) ───────────
export const authApi = {
  signup: (body) => api.post('/api/auth/signup', body, { auth: false }),
  login: (body) => api.post('/api/auth/login', body, { auth: false }),
  me: () => api.get('/api/auth/me'),
  logout: (refreshToken) => api.post('/api/auth/logout', { refreshToken }, { auth: false }),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }, { auth: false }),
  resetPassword: (token, newPassword) => api.post('/api/auth/reset-password', { token, newPassword }, { auth: false }),
  verifyEmail: (token) => api.post('/api/auth/verify-email', { token }, { auth: false }),
  changePassword: (currentPassword, newPassword) => api.post('/api/auth/change-password', { currentPassword, newPassword }),
  changeEmail: (newEmail, currentPassword) => api.post('/api/auth/change-email', { newEmail, currentPassword }),
  deleteAccount: (currentPassword) => api.post('/api/auth/delete-account', { currentPassword }),
}

export const profileApi = {
  me: () => api.get('/api/profiles/me'),
  get: (id) => api.get(`/api/profiles/${id}`),
  getByHandle: (handle) => api.get(`/api/profiles/handle/${handle}`),
  updateMe: (patch) => api.patch('/api/profiles/me', patch),
  search: (q, limit) => api.get('/api/profiles/search', { query: { q, limit } }),
  suggestions: (limit) => api.get('/api/profiles/suggestions', { query: { limit } }),
  connections: (id, limit) => api.get(`/api/profiles/${id}/connections`, { query: { limit } }),
  recordView: (id) => api.post(`/api/profiles/${id}/view`),
  liveNow: (limit) => api.get('/api/profiles/live', { query: { limit } }),
  setLive: (isLive, liveStreamUrl) => api.patch('/api/profiles/me/live', { isLive, liveStreamUrl }),
}

export const profileViewApi = {
  summary: () => api.get('/api/profile-views/me/summary'),
  list: (limit) => api.get('/api/profile-views/me', { query: { limit } }),
}

export const postApi = {
  feed: (cursor, limit) => api.get('/api/posts/feed', { query: { cursor, limit } }),
  create: (body) => api.post('/api/posts', body),
  byUser: (userId, cursor, limit) => api.get(`/api/posts/user/${userId}`, { query: { cursor, limit } }),
  comments: (id, cursor, limit) => api.get(`/api/posts/${id}/comments`, { query: { cursor, limit } }),
  addComment: (id, content) => api.post(`/api/posts/${id}/comments`, { content }),
  deleteComment: (commentId) => api.delete(`/api/posts/comments/${commentId}`),
  delete: (id) => api.delete(`/api/posts/${id}`),
  like: (id) => api.post(`/api/posts/${id}/like`),
  unlike: (id) => api.delete(`/api/posts/${id}/like`),
  likes: (id, limit) => api.get(`/api/posts/${id}/likes`, { query: { limit } }),
}

export const connectionApi = {
  list: () => api.get('/api/connections'),
  create: (addresseeId) => api.post('/api/connections', { addresseeId }),
  respond: (id, status) => api.patch(`/api/connections/${id}`, { status }),
  delete: (id) => api.delete(`/api/connections/${id}`),
}

export const followApi = {
  myFollowing: (cursor, limit) => api.get('/api/follows/me/following', { query: { cursor, limit } }),
  myFollowers: (cursor, limit) => api.get('/api/follows/me/followers', { query: { cursor, limit } }),
  userFollowing: (userId, cursor, limit) => api.get(`/api/follows/${userId}/following`, { query: { cursor, limit } }),
  follow: (userId) => api.post(`/api/follows/${userId}`),
  unfollow: (userId) => api.delete(`/api/follows/${userId}`),
}

export const messageApi = {
  conversations: () => api.get('/api/messages/conversations'),
  with: (userId, before, limit) => api.get(`/api/messages/with/${userId}`, { query: { before, limit } }),
  send: (receiverId, content) => api.post('/api/messages', { receiverId, content }),
  markRead: (userId) => api.patch(`/api/messages/with/${userId}/read`),
}

export const companyApi = {
  list: (cursor, limit) => api.get('/api/companies', { query: { cursor, limit } }),
  bySlug: (slug) => api.get(`/api/companies/${slug}`),
  create: (body) => api.post('/api/companies', body),
  update: (id, patch) => api.patch(`/api/companies/${id}`, patch),
  delete: (id) => api.delete(`/api/companies/${id}`),
}

export const jobApi = {
  list: (filters) => api.get('/api/jobs', { query: filters }),
  get: (id) => api.get(`/api/jobs/${id}`),
  create: (body) => api.post('/api/jobs', body),
  update: (id, patch) => api.patch(`/api/jobs/${id}`, patch),
  delete: (id) => api.delete(`/api/jobs/${id}`),
  apply: (id, body) => api.post(`/api/jobs/${id}/apply`, body),
  applications: (id) => api.get(`/api/jobs/${id}/applications`),
  myApplications: () => api.get('/api/applications/me'),
}

export const analyticsApi = {
  me: () => api.get('/api/analytics/me'),
}

export const platformApi = {
  list: () => api.get('/api/platforms'),
  create: (body) => api.post('/api/platforms', body),
  update: (id, patch) => api.patch(`/api/platforms/${id}`, patch),
  delete: (id) => api.delete(`/api/platforms/${id}`),
}

export const subscriptionApi = {
  me: () => api.get('/api/subscriptions/me'),
}

export const leaderboardApi = {
  list: ({ period = 'weekly', periodStart, platform, overall } = {}) =>
    api.get('/api/leaderboard', { query: { period, periodStart, platform, overall } }),
  create: (body) => api.post('/api/leaderboard', body),
  update: (id, patch) => api.patch(`/api/leaderboard/${id}`, patch),
  delete: (id) => api.delete(`/api/leaderboard/${id}`),
}

export const reviewApi = {
  platformSummary: (slug) => api.get(`/api/reviews/platforms/${slug}`),
  platformList: (slug, limit) => api.get(`/api/reviews/platforms/${slug}/list`, { query: { limit } }),
  upsertPlatform: (slug, body) => api.post(`/api/reviews/platforms/${slug}`, body),
  deleteMyPlatform: (slug) => api.delete(`/api/reviews/platforms/${slug}/mine`),
  companySummary: (slug) => api.get(`/api/reviews/companies/${slug}`),
  companyList: (slug, limit) => api.get(`/api/reviews/companies/${slug}/list`, { query: { limit } }),
  upsertCompany: (slug, body) => api.post(`/api/reviews/companies/${slug}`, body),
  deleteMyCompany: (slug) => api.delete(`/api/reviews/companies/${slug}/mine`),
}

export const notificationApi = {
  list: ({ cursor, limit, unreadOnly } = {}) => api.get('/api/notifications', { query: { cursor, limit, unreadOnly } }),
  unreadCount: () => api.get('/api/notifications/unread-count'),
  markAllRead: () => api.patch('/api/notifications/read'),
  markOneRead: (id) => api.patch(`/api/notifications/${id}/read`),
}

export const adminApi = {
  stats: () => api.get('/api/admin/stats'),
  users: ({ q, role, limit, cursor } = {}) => api.get('/api/admin/users', { query: { q, role, limit, cursor } }),
  suspend: (id, suspended) => api.patch(`/api/admin/users/${id}/suspend`, { suspended }),
  setRole: (id, role) => api.patch(`/api/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  deletePost: (id) => api.delete(`/api/admin/posts/${id}`),
  hidePlatformReview: (id, hidden) => api.patch(`/api/admin/reviews/platform/${id}/hide`, { hidden }),
  hideCompanyReview: (id, hidden) => api.patch(`/api/admin/reviews/company/${id}/hide`, { hidden }),
  flaggedReviews: () => api.get('/api/admin/reviews/flagged'),
}

export const uploadApi = {
  status: () => api.get('/api/uploads/status'),
  presign: ({ kind, contentType, contentLength }) => api.post('/api/uploads/presign', { kind, contentType, contentLength }),
  // Put the file directly to the presigned URL. `auth: false` because Object Storage
  // does its own signature check — sending Bearer would break it.
  putToPresigned: async (uploadUrl, file) => {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type, 'Cache-Control': 'public, max-age=31536000, immutable' },
      body: file,
    })
    if (!res.ok) throw new ApiError(res.status, 'UPLOAD_FAILED', 'Upload failed')
  },
}

export const stripeApi = {
  status: () => api.get('/api/stripe/status'),
  checkout: ({ plan, billing }) => api.post('/api/stripe/checkout', { plan, billing }),
}

// Convenience helper: pick a file, presign, PUT, return public URL.
export async function uploadFile({ file, kind }) {
  if (!file) throw new Error('No file selected')
  const { uploadUrl, publicUrl } = await uploadApi.presign({
    kind,
    contentType: file.type,
    contentLength: file.size,
  })
  await uploadApi.putToPresigned(uploadUrl, file)
  return publicUrl
}
