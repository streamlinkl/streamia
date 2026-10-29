'use client'
// Hydrates the client auth store from the server session (this page lives
// outside the (app) shell), then renders the shared PostCard.
import { useEffect } from 'react'
import { useAuthStore } from '@/lib/store'
import PostCard from '@/components/feed/PostCard'
import Toast from '@/components/Toast'

export default function PostView({ post, me }) {
  const hydrate = useAuthStore((s) => s.hydrate)
  useEffect(() => { hydrate(me) }, [hydrate, me])
  return (
    <>
      <PostCard post={post} />
      <Toast />
    </>
  )
}
