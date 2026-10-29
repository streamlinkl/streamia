'use client'
// Post card shared by the feed, profiles and the public /post/[id] page.
// QA report (12 Oct 2026): comments on every surface (#3), repost (#3),
// share icon top-right (#3), own-post ⋯ menu with Delete (#6), full images
// with a zoomable viewer (#5).
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { mutate } from 'swr'
import {
  Heart, Loader2, MessageCircle, MoreHorizontal, Repeat2, Send, Share2, Trash2, X,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { postApi } from '@/lib/api-client'
import { useAuthStore, useAppStore } from '@/lib/store'
import PremiumBadge from '@/components/PremiumBadge'
import PostImage from '@/components/feed/PostImage'

function Avatar({ author, size = 44 }) {
  const initials = author?.displayName?.slice(0, 2).toUpperCase() || '??'
  return (
    <Link href={`/profile/${author?.id}`} style={{ width: size, height: size }}
      className="rounded-full bg-graduate-radial flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden hover:opacity-80 transition">
      {author?.avatarUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={author.avatarUrl} alt="" className="w-full h-full object-cover" />
        : initials}
    </Link>
  )
}

/** ⋯ menu — only rendered when there is something to offer (own post / own repost). */
function PostMenu({ items }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', close)
    window.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', close); window.removeEventListener('keydown', onKey) }
  }, [open])
  if (!items.length) return null
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Post options" aria-expanded={open}
        className="w-8 h-8 inline-flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition">
        <MoreHorizontal className="w-[18px] h-[18px]" strokeWidth={2.25} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-9 z-20 min-w-[170px] bg-white border border-gray-200 rounded-xl shadow-lg py-1">
          {items.map((it) => (
            <button key={it.label} type="button" role="menuitem" onClick={() => { setOpen(false); it.onClick() }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-[13px] font-semibold text-left hover:bg-gray-50 ${it.danger ? 'text-red-600' : 'text-gray-700'}`}>
              <it.Icon className="w-4 h-4" strokeWidth={2.25} /> {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * @param post       feed/profile row; a repost row carries the original in `repostOf`
 * @param onDeleted  called with the row id after the user deletes their post / undoes their repost
 */
export default function PostCard({ post, onDeleted }) {
  const router = useRouter()
  const { profile: me } = useAuthStore()
  const { showToast } = useAppStore()
  // A repost row renders the original; actions target the original.
  const target = post.repostOf || post
  const reposter = post.repostOf ? post.author : null
  const [liked, setLiked] = useState(Boolean(target.viewerHasLiked))
  const [count, setCount] = useState(target.likesCount || 0)
  const [commentCount, setCommentCount] = useState(target.commentsCount || 0)
  const [reposted, setReposted] = useState(Boolean(target.viewerHasReposted))
  const [repostCount, setRepostCount] = useState(target.repostsCount || 0)
  const [reposting, setReposting] = useState(false)
  const [showLikers, setShowLikers] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const timeAgo = target.createdAt ? formatDistanceToNow(new Date(target.createdAt), { addSuffix: true }) : ''

  // Logged-out viewers (public /post/[id]) are sent to sign in for actions.
  const requireMe = () => {
    if (me) return true
    router.push(`/login?next=${encodeURIComponent(`/post/${target.id}`)}`)
    return false
  }

  const handleLike = async () => {
    if (!requireMe()) return
    const next = !liked
    setLiked(next); setCount((c) => c + (next ? 1 : -1))
    try {
      const res = next ? await postApi.like(target.id) : await postApi.unlike(target.id)
      if (typeof res?.likesCount === 'number') setCount(res.likesCount)
    } catch {
      setLiked(!next); setCount((c) => c + (next ? -1 : 1))
    }
  }

  const handleRepost = async () => {
    if (!requireMe() || reposting) return
    setReposting(true)
    try {
      const res = reposted ? await postApi.unrepost(target.id) : await postApi.repost(target.id)
      setReposted(Boolean(res?.viewerHasReposted))
      if (typeof res?.repostsCount === 'number') setRepostCount(res.repostsCount)
      showToast(res?.viewerHasReposted ? 'Reposted to your profile' : 'Repost removed')
      if (!res?.viewerHasReposted && reposter && reposter.id === me?.id) onDeleted?.(post.id)
      mutate('feed')
    } catch (err) {
      showToast(err.message || 'Could not repost', 'error')
    } finally {
      setReposting(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${target.id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: `${target.author?.displayName} on StreamLink`, text: target.content?.trim() || undefined, url })
      } else {
        await navigator.clipboard.writeText(url)
        showToast('Link copied to clipboard')
      }
    } catch { /* share sheet dismissed */ }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    try {
      await postApi.delete(target.id)
      showToast('Post deleted')
      onDeleted?.(post.id)
      mutate('feed')
    } catch (err) {
      showToast(err.message || 'Could not delete the post', 'error')
    }
  }

  const menu = []
  if (me && target.author?.id === me.id) menu.push({ label: 'Delete post', Icon: Trash2, danger: true, onClick: handleDelete })
  if (me && reposter?.id === me.id && reposted) menu.push({ label: 'Undo repost', Icon: Repeat2, onClick: handleRepost })

  // Original was deleted between list fetch and render — nothing to show.
  if (post.repostOfId && !post.repostOf) return null

  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
      {reposter && (
        <div className="flex items-center gap-1.5 px-4 pt-3 text-[11.5px] font-semibold text-gray-400">
          <Repeat2 className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden />
          <Link href={`/profile/${reposter.id}`} className="hover:underline">
            {reposter.id === me?.id ? 'You' : reposter.displayName} reposted
          </Link>
        </div>
      )}
      <div className="flex gap-3 p-4 pb-0 items-start">
        <Avatar author={target.author} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/profile/${target.author?.id}`} className="text-[13.5px] font-bold hover:underline truncate">{target.author?.displayName || 'Unknown'}</Link>
            {target.author?.isVerified && <PremiumBadge size={13} />}
            {target.author?.isLive && <span className="text-[9.5px] bg-live text-white font-black px-1.5 py-0.5 rounded-full">LIVE</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {target.author?.category && <span className="text-[11.5px] text-gray-400">{target.author.category}</span>}
            <Link href={`/post/${target.id}`} className="text-[11px] text-gray-300 hover:text-gray-500 hover:underline">{timeAgo}</Link>
          </div>
        </div>
        {/* Share sits top-right of the card header (QA #3) */}
        <div className="flex items-center gap-0.5 -mr-1.5 -mt-1">
          <button type="button" onClick={handleShare} aria-label="Share post"
            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-gray-400 hover:text-accent hover:bg-accent-lt transition">
            <Share2 className="w-4 h-4" strokeWidth={2.25} />
          </button>
          <PostMenu items={menu} />
        </div>
      </div>
      {target.content?.trim() && (
        <div className="px-4 py-3">
          <p className="text-[13.5px] leading-relaxed text-gray-800 whitespace-pre-wrap">{target.content}</p>
        </div>
      )}
      {target.mediaUrl && (
        <div className={`px-4 pb-3 ${target.content?.trim() ? '' : 'pt-3'}`}>
          <PostImage src={target.mediaUrl} />
        </div>
      )}
      <div className="flex border-t border-gray-100">
        <button onClick={handleLike}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold transition hover:bg-gray-50 rounded-bl-xl
            ${liked ? 'text-live' : 'text-gray-500'}`}>
          <Heart className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} strokeWidth={2.25} />
          <span onClick={(e) => { e.stopPropagation(); if (count > 0) setShowLikers(true) }} className={count > 0 ? 'hover:underline' : ''}>{count}</span>
        </button>
        <button onClick={() => { if (requireMe()) setShowComments((s) => !s) }}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold transition hover:bg-gray-50
            ${showComments ? 'text-accent' : 'text-gray-500'}`}>
          <MessageCircle className="w-4 h-4" strokeWidth={2.25} /> {commentCount}
        </button>
        <button onClick={handleRepost} disabled={reposting} aria-pressed={reposted}
          className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold transition hover:bg-gray-50 rounded-br-xl disabled:opacity-60
            ${reposted ? 'text-emerald-600' : 'text-gray-500'}`}>
          {reposting ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.25} /> : <Repeat2 className="w-4 h-4" strokeWidth={2.25} />}
          {reposted ? 'Reposted' : 'Repost'}{repostCount > 0 ? ` · ${repostCount}` : ''}
        </button>
      </div>
      {showComments && <CommentSection postId={target.id} me={me} onCountChange={setCommentCount} />}
      {showLikers && <LikesModal postId={target.id} onClose={() => setShowLikers(false)} />}
    </article>
  )
}

function CommentSection({ postId, me, onCountChange }) {
  const { showToast } = useAppStore()
  const [items, setItems] = useState(null)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    let cancelled = false
    postApi.comments(postId, undefined, 50)
      .then((res) => { if (!cancelled) setItems((res?.items || []).slice().reverse()) })
      .catch(() => { if (!cancelled) setItems([]) })
    return () => { cancelled = true }
  }, [postId])

  const submit = async () => {
    const text = draft.trim()
    if (!text || posting) return
    setPosting(true)
    try {
      const created = await postApi.addComment(postId, text)
      setItems((prev) => [...(prev ?? []), created])
      onCountChange?.((c) => c + 1)
      setDraft('')
    } catch (err) {
      showToast(err.message || 'Could not post comment', 'error')
    } finally {
      setPosting(false)
    }
  }

  const remove = async (id) => {
    try {
      await postApi.deleteComment(id)
      setItems((prev) => prev?.filter((c) => c.id !== id) ?? [])
      onCountChange?.((c) => Math.max(c - 1, 0))
    } catch (err) {
      showToast(err.message || 'Could not delete', 'error')
    }
  }

  return (
    <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3">
      {items === null ? (
        <div className="flex justify-center py-3"><Loader2 className="w-4 h-4 text-gray-400 animate-spin" strokeWidth={2.5} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-2 text-[12px] text-gray-400">Be the first to comment.</div>
      ) : (
        <div className="space-y-2.5 mb-3">
          {items.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <Link href={`/profile/${c.author?.id}`} className="w-7 h-7 rounded-full bg-graduate-radial flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden">
                {c.author?.avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={c.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : (c.author?.displayName || '??').slice(0, 2).toUpperCase()}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="bg-white border border-gray-100 rounded-2xl px-3 py-2">
                  <span className="inline-flex items-center gap-1 align-middle">
                    <Link href={`/profile/${c.author?.id}`} className="text-[12px] font-extrabold hover:underline">{c.author?.displayName}</Link>
                    {c.author?.isVerified && <PremiumBadge size={11} />}
                  </span>
                  <p className="text-[12.5px] text-gray-700 leading-snug whitespace-pre-wrap mt-0.5">{c.content}</p>
                </div>
                <div className="flex items-center gap-3 mt-1 px-3">
                  <span className="text-[10.5px] text-gray-400">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                  {me?.id === c.author?.id && (
                    <button onClick={() => remove(c.id)} className="inline-flex items-center gap-1 text-[10.5px] text-gray-400 hover:text-red-500 transition">
                      <Trash2 className="w-3 h-3" strokeWidth={2.25} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className="w-7 h-7 rounded-full bg-graduate-radial flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 overflow-hidden">
          {me?.avatarUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={me.avatarUrl} alt="" className="w-full h-full object-cover" />
            : (me?.displayName || '??').slice(0, 2).toUpperCase()}
        </div>
        <textarea rows={1} value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() } }}
          placeholder="Write a comment…"
          className="flex-1 min-h-[34px] max-h-32 bg-white border border-gray-200 rounded-2xl px-3 py-1.5 text-[12.5px] outline-none focus:border-accent transition resize-none" />
        <button onClick={submit} disabled={!draft.trim() || posting}
          className="inline-flex items-center gap-1 h-[34px] px-3 btn-gradient text-white text-[11.5px] font-bold rounded-full transition disabled:opacity-50 flex-shrink-0">
          {posting ? <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2.5} /> : <Send className="w-3 h-3" strokeWidth={2.5} />}
          Post
        </button>
      </div>
    </div>
  )
}

function LikesModal({ postId, onClose }) {
  const [likers, setLikers] = useState(null)
  useEffect(() => {
    let cancelled = false
    postApi.likes(postId, 50)
      .then((list) => { if (!cancelled) setLikers(list || []) })
      .catch(() => { if (!cancelled) setLikers([]) })
    return () => { cancelled = true }
  }, [postId])

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-extrabold">Liked by</h3>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700">
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
        <div className="p-3">
          {likers === null && <div className="text-center py-6 text-sm text-gray-400">Loading…</div>}
          {likers && likers.length === 0 && <div className="text-center py-6 text-sm text-gray-400">No likes yet</div>}
          {likers && likers.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="w-9 h-9 rounded-full bg-graduate-radial flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                {p.avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : (p.displayName || '??').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold flex items-center gap-1 min-w-0">
                  <span className="truncate">{p.displayName}</span>
                  {p.isVerified && <PremiumBadge size={12} />}
                </div>
                <div className="text-[11px] text-gray-400">@{p.handle}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}