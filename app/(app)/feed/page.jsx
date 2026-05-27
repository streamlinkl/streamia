import { apiServer } from '@/lib/api-server'
import Feed from '@/components/feed/Feed'

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  // SSR fetch — initial 20 posts so the first paint already shows real
  // content. SWR takes over for refreshes and optimistic updates.
  let initialPosts = []
  try {
    const result = await apiServer.get('/api/posts/feed', { query: { limit: 20 } })
    initialPosts = result?.items || []
  } catch { /* render empty feed on failure */ }

  return <Feed initialPosts={initialPosts} />
}
