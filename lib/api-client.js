// Browser-side API client for Next.js client components.
// Mirrors src/lib/api.js (Vite) but reads NEXT_PUBLIC_API_URL and never
// touches localStorage — auth is handled entirely by httpOnly cookies.

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.streamia.co'

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
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: '{}',
  })
  if (!res.ok) throw new ApiError(res.status, 'REFRESH_FAILED', 'Session expired')
  return res.json()
}

function getQueuedRefresh() {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => { refreshInFlight = null })
  }
  return refreshInFlight
}

async function request(method, path, { body, query, retry = true } = {}) {
  const url = new URL(path.startsWith('http') ? path : `${API_URL}${path}`)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === '') continue
      url.searchParams.set(k, String(v))
    }
  }

  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(url, {
    method,
    headers,
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (res.status === 401 && retry) {
    try {
      await getQueuedRefresh()
      return request(method, path, { body, query, retry: false })
    } catch { /* fall through */ }
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

// ─────────── Endpoint shortcuts ───────────
export const authApi = {
  signup: (body) => api.post('/api/auth/signup', body),
  login: (body) => api.post('/api/auth/login', body),
  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout', {}),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/api/auth/reset-password', { token, newPassword }),
  verifyEmail: (token) => api.post('/api/auth/verify-email', { token }),
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
  follow: (userId) => api.post(`/api/follows/${userId}`),
  unfollow: (userId) => api.delete(`/api/follows/${userId}`),
}

export const messageApi = {
  conversations: () => api.get('/api/messages/conversations'),
  with: (userId, before, limit) => api.get(`/api/messages/with/${userId}`, { query: { before, limit } }),
  send: (receiverId, content) => api.post('/api/messages', { receiverId, content }),
  markRead: (userId) => api.patch(`/api/messages/with/${userId}/read`),
}

export const notificationApi = {
  list: ({ cursor, limit, unreadOnly } = {}) => api.get('/api/notifications', { query: { cursor, limit, unreadOnly } }),
  unreadCount: () => api.get('/api/notifications/unread-count'),
  markAllRead: () => api.patch('/api/notifications/read'),
  markOneRead: (id) => api.patch(`/api/notifications/${id}/read`),
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

export const stripeApi = {
  status: () => api.get('/api/stripe/status'),
  checkout: ({ plan, billing }) => api.post('/api/stripe/checkout', { plan, billing }),
}

export const uploadApi = {
  status: () => api.get('/api/uploads/status'),
  presign: ({ kind, contentType, contentLength }) => api.post('/api/uploads/presign', { kind, contentType, contentLength }),
  putToPresigned: async (uploadUrl, file) => {
    const res = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type, 'Cache-Control': 'public, max-age=31536000, immutable' },
      body: file,
    })
    if (!res.ok) throw new ApiError(res.status, 'UPLOAD_FAILED', 'Upload failed')
  },
}

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
