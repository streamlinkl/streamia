// Public post page — the target of "Share" links (QA report #3). Readable
// without a session; actions on the card send logged-out visitors to sign in.
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { apiServer, getMeServer } from '@/lib/api-server'
import PostView from './PostView'

export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function loadPost(id) {
  if (!UUID.test(id)) return null
  try {
    return await apiServer.get(`/api/posts/${id}`)
  } catch (err) {
    if (err?.status === 404 || err?.status === 400) return null
    throw err
  }
}

export async function generateMetadata({ params }) {
  const post = await loadPost(String(params.id)).catch(() => null)
  if (!post) return { title: 'Post not found' }
  const author = post.author?.displayName || 'StreamLink'
  const description = post.content?.trim().slice(0, 160) || `A post by ${author} on StreamLink.`
  const image = post.mediaUrl || post.author?.avatarUrl || undefined
  return {
    title: `${author} on StreamLink`,
    description,
    openGraph: {
      title: `${author} on StreamLink`,
      description,
      url: `https://streamia.co/post/${post.id}`,
      siteName: 'StreamLink',
      type: 'article',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: post.mediaUrl ? 'summary_large_image' : 'summary', title: `${author} on StreamLink`, description, images: image ? [image] : undefined },
  }
}

export default async function PostPage({ params }) {
  const [post, me] = await Promise.all([loadPost(String(params.id)), getMeServer().catch(() => null)])
  if (!post) notFound()
  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[680px] mx-auto h-14 px-4 flex items-center justify-between">
          <Link href={me ? '/feed' : '/'} aria-label="StreamLink — home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-wordmark.svg" alt="StreamLink" className="h-6 w-auto" />
          </Link>
          {me ? (
            <Link href="/feed" className="text-[13px] font-semibold text-gray-600 hover:text-ink">Back to feed</Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={`/login?next=/post/${post.id}`} className="px-3 py-1.5 text-[13px] font-semibold text-gray-600 hover:text-ink">Sign in</Link>
              <Link href="/register" className="btn-gradient px-4 py-1.5 rounded-full text-[13px] font-bold text-white">Join StreamLink</Link>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-[680px] mx-auto px-3 py-6">
        <PostView post={post} me={me} />
      </main>
    </div>
  )
}
