'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import {
  Image as ImageIcon, Loader2, X,
} from 'lucide-react'
import { postApi, profileApi, uploadFile } from '@/lib/api-client'
import { useAuthStore, useAppStore } from '@/lib/store'
import { getSocket } from '@/lib/socket'
import PremiumBadge from '@/components/PremiumBadge'
import { SkeletonPost, SkeletonProfile } from '@/components/Skeleton'
import PostCard from '@/components/feed/PostCard'
import ImageLightbox from '@/components/ImageLightbox'

// Top-level client wrapper. Receives initial posts from the server page so
// the first paint already has content; SWR takes over for subsequent updates.
export default function Feed({ initialPosts = [] }) {
  const { data: posts } = useSWR(
    'feed',
    async () => (await postApi.feed(undefined, 20)).items || [],
    { fallbackData: initialPosts, revalidateOnFocus: false }
  )
  const { profile } = useAuthStore()

  return (
    <div className="max-w-[1100px] mx-auto px-3 py-4">
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr_280px] gap-4">
        {/* Left sidebar */}
        <aside className="hidden md:block space-y-3">
          <ProfileSidebar profile={profile} />
          <TrendingTags />
        </aside>

        {/* Feed */}
        <main className="space-y-3">
          {/* Mobile-only (QA #8): Live Now, then the composer, then posts. The
              profile card + trending tags stay in the desktop sidebar; the
              profile is one tap away on the avatar. */}
          <div className="md:hidden">
            <LiveNowStrip />
          </div>
          <Composer />
          {!posts
            ? Array(4).fill(0).map((_, i) => <SkeletonPost key={i} />)
            : posts.length === 0
              ? (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 text-sm font-bold">No posts yet — be the first.</div>
              )
              : posts.map((post) => <PostCard key={post.id} post={post} />)
          }
        </main>

        {/* Right sidebar */}
        <aside className="hidden md:block space-y-3 sticky top-20">
          <LiveNowSidebar />
        </aside>
      </div>
    </div>
  )
}

// ── Composer ──
function Composer() {
  const { showToast } = useAppStore()
  const { profile } = useAuthStore()
  const [content, setContent] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(false)
  const inputRef = useRef(null)

  const pickImage = () => inputRef.current?.click()

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadFile({ file, kind: 'post' })
      setMediaUrl(url)
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handlePost = async () => {
    if (!content.trim() && !mediaUrl) return
    setLoading(true)
    try {
      await postApi.create({ content: content.trim() || ' ', mediaUrl: mediaUrl || null, postType: mediaUrl ? 'clip' : 'text' })
      setContent(''); setMediaUrl('')
      showToast('Posted')
      // Optimistically reload the feed
      const { mutate } = await import('swr')
      mutate('feed')
    } catch (err) {
      showToast(err.message || 'Could not post', 'error')
    } finally {
      setLoading(false)
    }
  }

  const initials = profile?.displayName?.slice(0, 2).toUpperCase() || '??'

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="flex gap-3 items-start mb-3">
        <div className="w-10 h-10 rounded-full bg-graduate-radial flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
          {profile?.avatarUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            : initials}
        </div>
        <div className="flex-1">
          <textarea
            className="w-full min-h-[44px] max-h-32 bg-bg border border-gray-200 rounded-2xl px-4 py-2.5 text-[13px] outline-none focus:bg-white focus:border-accent transition resize-none"
            placeholder="Share something with the community…"
            value={content}
            rows={1}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && !e.metaKey && (e.preventDefault(), handlePost())}
          />
          {mediaUrl && (
            <div className="mt-2 relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <button type="button" onClick={() => setPreview(true)} aria-label="Preview image" className="block cursor-zoom-in">
                <img src={mediaUrl} alt="Attached" className="max-h-48 rounded-xl border border-gray-200" />
              </button>
              <button type="button" onClick={() => setMediaUrl('')}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition"
                aria-label="Remove image">
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
              {preview && <ImageLightbox src={mediaUrl} alt="Attached image" onClose={() => setPreview(false)} />}
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <button type="button" onClick={pickImage} disabled={uploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11.5px] text-gray-500 hover:text-accent font-semibold transition rounded-full hover:bg-accent-lt disabled:opacity-50">
          {uploading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.25} /> Uploading…</>
            : <><ImageIcon className="w-3.5 h-3.5" strokeWidth={2.25} /> Add image</>}
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFile} />
        <button onClick={handlePost} disabled={(!content.trim() && !mediaUrl) || loading}
          className="px-5 py-1.5 btn-gradient text-white text-[13px] font-bold rounded-full transition disabled:opacity-50 flex items-center gap-2">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} /> : null}
          Post
        </button>
      </div>
    </div>
  )
}


// ── Sidebar widgets ──
function ProfileSidebar({ profile }) {
  if (!profile) return <SkeletonProfile />
  const initials = profile.displayName?.slice(0, 2).toUpperCase() || '??'
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      {profile.bannerUrl
        ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={profile.bannerUrl} alt="" className="h-14 w-full object-cover" />
        )
        : <div className="h-14 bg-aurora opacity-70" />}
      <div className="px-4 pb-4">
        <div className="w-14 h-14 rounded-full bg-graduate-radial border-4 border-white -mt-7 flex items-center justify-center text-white font-extrabold text-lg overflow-hidden mb-2">
          {profile.avatarUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
            : initials}
        </div>
        <div className="font-extrabold text-[14px] flex items-center gap-1">
          <span className="truncate">{profile.displayName}</span>
          {profile.isVerified && <PremiumBadge size={13} />}
        </div>
        <div className="text-[11.5px] text-gray-400 mb-3">@{profile.handle}{profile.category && ` · ${profile.category}`}</div>
        <div className="flex justify-between text-center border-t border-gray-100 pt-3">
          {[['Connections', profile.connectionsCount || 0], ['Followers', profile.followersCount || 0]].map(([k, v]) => (
            <div key={k}>
              <div className="text-[15px] font-extrabold text-accent">{v}</div>
              <div className="text-[10px] text-gray-400">{k}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TrendingTags() {
  const TAGS = ['#FPS', '#JustChatting', '#Valorant', '#Minecraft', '#IRL', '#Music']
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="text-[12.5px] font-extrabold text-gray-500 uppercase tracking-wider mb-3">Trending Tags</div>
      <div className="flex flex-wrap gap-1.5">
        {TAGS.map((t) => (
          <span key={t} className="text-[11.5px] text-accent bg-accent-lt font-bold px-2.5 py-1 rounded-full cursor-pointer hover:bg-accent hover:text-white transition">{t}</span>
        ))}
      </div>
    </div>
  )
}

function LiveNowSidebar() {
  const { data: live } = useSWR('live-now', () => profileApi.liveNow(8), { refreshInterval: 60_000 })
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <div className="w-2 h-2 bg-live rounded-full animate-pulse" />
        <span className="text-[12.5px] font-extrabold">Live Now</span>
      </div>
      {!live ? (
        <div className="px-4 py-6 text-center text-[11.5px] text-gray-400">Loading…</div>
      ) : live.length === 0 ? (
        <div className="px-4 py-6 text-center text-[11.5px] text-gray-400">No streamers live right now</div>
      ) : (
        live.map((s) => {
          const initials = (s.displayName || '??').slice(0, 2).toUpperCase()
          const Inner = (
            <>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-live to-red-400 flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0">
                {s.avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={s.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold flex items-center gap-1 min-w-0">
                  <span className="truncate">{s.displayName}</span>
                  {s.isVerified && <PremiumBadge size={11} />}
                </div>
                <div className="text-[10.5px] text-gray-400 truncate">@{s.handle}{s.category ? ` · ${s.category}` : ''}</div>
              </div>
              <div className="w-1.5 h-1.5 bg-live rounded-full flex-shrink-0" />
            </>
          )
          return s.liveStreamUrl ? (
            <a key={s.id} href={s.liveStreamUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition">{Inner}</a>
          ) : (
            <Link key={s.id} href={`/profile/${s.id}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition">{Inner}</Link>
          )
        })
      )}
    </div>
  )
}

// Compact horizontal Live-Now strip for the mobile feed (matches the app).
// Shares the 'live-now' SWR cache with LiveNowSidebar, so no extra fetch.
function LiveNowStrip() {
  const { data: live } = useSWR('live-now', () => profileApi.liveNow(8), { refreshInterval: 60_000 })
  if (!live || live.length === 0) return null
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-2 h-2 bg-live rounded-full animate-pulse" />
        <span className="text-[12px] font-extrabold uppercase tracking-wider text-gray-500">Live Now</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3">
        {live.map((s) => {
          const initials = (s.displayName || '??').slice(0, 2).toUpperCase()
          const card = (
            <div className="flex-shrink-0 w-28 bg-white border border-gray-200 rounded-xl shadow-sm p-3 text-center">
              <div className="w-11 h-11 mx-auto rounded-xl bg-gradient-to-br from-live to-red-400 flex items-center justify-center text-white font-bold text-sm overflow-hidden mb-2">
                {s.avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={s.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : initials}
              </div>
              <div className="text-[12px] font-extrabold flex items-center justify-center gap-1 min-w-0">
                <span className="w-1.5 h-1.5 bg-live rounded-full flex-shrink-0" />
                <span className="truncate">{s.displayName}</span>
                {s.isVerified && <PremiumBadge size={10} />}
              </div>
              <div className="text-[10.5px] text-gray-400 truncate">{s.category || '—'}</div>
            </div>
          )
          return s.liveStreamUrl ? (
            <a key={s.id} href={s.liveStreamUrl} target="_blank" rel="noopener noreferrer">{card}</a>
          ) : (
            <Link key={s.id} href={`/profile/${s.id}`}>{card}</Link>
          )
        })}
      </div>
    </div>
  )
}
