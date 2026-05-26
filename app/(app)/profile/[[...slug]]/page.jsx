import { notFound } from 'next/navigation'
import { apiServer, getMeServer } from '@/lib/api-server'
import Profile from '@/components/profile/Profile'

export const dynamic = 'force-dynamic'

/**
 * /profile         → my own profile (uses cookie)
 * /profile/<uuid>  → someone else's profile
 *
 * Server-fetches profile + first 50 posts so the first paint is dense.
 */
export default async function ProfilePage({ params }) {
  const slug = params?.slug
  const targetIdFromUrl = Array.isArray(slug) && slug.length > 0 ? slug[0] : null

  let profile = null
  let posts = []
  let viewingOwn = false

  try {
    if (targetIdFromUrl) {
      profile = await apiServer.get(`/api/profiles/${targetIdFromUrl}`)
    } else {
      profile = await apiServer.get('/api/profiles/me')
      viewingOwn = true
    }
    if (profile?.id) {
      const result = await apiServer.get(`/api/posts/user/${profile.id}`, { query: { limit: 50 } })
      posts = result?.items || []
    }
  } catch (err) {
    if (err?.status === 404) notFound()
    if (err?.status === 401) {
      // Middleware should already have caught this — but as defence:
      profile = null
    } else throw err
  }

  if (!profile) notFound()

  // If we hit /profile/<uuid> but it's actually our own id, mark as own.
  if (!viewingOwn) {
    const me = await getMeServer()
    viewingOwn = me?.id === profile.id
  }

  return <Profile initialProfile={profile} initialPosts={posts} viewingOwn={viewingOwn} />
}
