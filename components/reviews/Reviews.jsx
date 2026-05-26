'use client'
import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Loader2, Search, Star } from 'lucide-react'
import { platformApi, reviewApi } from '@/lib/api-client'
import { useAppStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import StarRating from '@/components/StarRating'

const CATEGORY_LABELS = {
  major: 'Major Platforms',
  asia: 'Asia Markets',
  social_stream: 'Social Streaming',
  video_chat: 'Video Chat',
  social_dating: 'Social / Dating',
  adult: 'Adult',
  regional: 'Regional',
  audio: 'Audio & Podcast',
  tools: 'Broadcast Tools',
}
const CATEGORY_ORDER = ['major', 'asia', 'social_stream', 'video_chat', 'social_dating', 'adult', 'regional', 'audio', 'tools']

export default function ReviewsPage() {
  const { showToast } = useAppStore()
  const [platforms, setPlatforms] = useState([])
  const [selected, setSelected] = useState(null) // slug
  const [summary, setSummary] = useState(null)
  const [reviews, setReviews] = useState([])
  const [myRating, setMyRating] = useState(0)
  const [myContent, setMyContent] = useState('')
  const [loadingSel, setLoadingSel] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    platformApi.list()
      .then((list) => {
        setPlatforms(list)
        if (!selected && list.length > 0) setSelected(list[0].slug)
      })
      .catch(() => setPlatforms([]))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selected) return
    let cancelled = false
    setLoadingSel(true)
    Promise.all([reviewApi.platformSummary(selected), reviewApi.platformList(selected, 50)])
      .then(([s, list]) => {
        if (cancelled) return
        setSummary(s)
        setReviews(list || [])
      })
      .catch(() => { if (!cancelled) { setSummary(null); setReviews([]) } })
      .finally(() => { if (!cancelled) setLoadingSel(false) })
    return () => { cancelled = true }
  }, [selected])

  const submit = async () => {
    if (!selected || myRating < 1) return
    setSubmitting(true)
    try {
      await reviewApi.upsertPlatform(selected, { rating: myRating, content: myContent || null })
      showToast('Review saved')
      setMyContent('')
      setMyRating(0)
      // refresh
      const [s, list] = await Promise.all([reviewApi.platformSummary(selected), reviewApi.platformList(selected, 50)])
      setSummary(s)
      setReviews(list)
    } catch (err) {
      showToast(err.message || 'Could not save review', 'error')
    }
    setSubmitting(false)
  }

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q ? platforms.filter((p) => p.name.toLowerCase().includes(q) || p.slug.includes(q)) : platforms
    return CATEGORY_ORDER.reduce((acc, cat) => {
      const items = filtered.filter((p) => p.category === cat)
      if (items.length > 0) acc[cat] = items
      return acc
    }, {})
  }, [platforms, query])

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
        {/* Sidebar: platforms by category */}
        <aside className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
               style={{ maxHeight: 'calc(100dvh - 120px)' }}>
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" strokeWidth={2.25} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search platforms…"
                className="w-full h-9 pl-8 pr-3 bg-bg border border-gray-200 rounded-full text-[12.5px] outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {CATEGORY_ORDER.map((cat) => {
              const items = grouped[cat]
              if (!items) return null
              return (
                <div key={cat} className="border-b border-gray-50 last:border-0">
                  <div className="px-3 py-2 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    {CATEGORY_LABELS[cat]}
                  </div>
                  {items.map((p) => {
                    const active = selected === p.slug
                    return (
                      <button
                        key={p.slug}
                        onClick={() => setSelected(p.slug)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition
                          ${active ? 'bg-accent-lt border-l-[3px] border-l-accent' : 'hover:bg-gray-50 border-l-[3px] border-l-transparent'}`}>
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.brandColor || '#9CA3AF' }} />
                        <span className={`flex-1 text-[13px] truncate ${active ? 'font-extrabold text-gray-900' : 'font-semibold text-gray-700'}`}>{p.name}</span>
                        <ChevronRight className={`w-3.5 h-3.5 transition ${active ? 'text-accent' : 'text-gray-300'}`} strokeWidth={2.25} />
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </aside>

        {/* Main: platform summary + reviews */}
        <main className="space-y-4">
          {loadingSel && (
            <div className="flex justify-center py-14">
              <Loader2 className="w-6 h-6 text-accent animate-spin" strokeWidth={2.5} />
            </div>
          )}

          {!loadingSel && summary && (
            <>
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">Platform review</div>
                    <h1 className="text-[22px] font-extrabold tracking-tight mt-1">{summary.platform.name}</h1>
                    <div className="text-[12.5px] text-gray-400 mt-0.5">@{summary.platform.slug}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-[28px] font-extrabold text-amber-500">
                        {summary.averageRating ? Number(summary.averageRating).toFixed(1) : '—'}
                      </span>
                      <StarRating value={summary.averageRating || 0} size={18} />
                    </div>
                    <div className="text-[11px] text-gray-400 mt-1">{summary.reviewCount} review{summary.reviewCount === 1 ? '' : 's'}</div>
                  </div>
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100">
                  <div className="text-[12px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">Write a review</div>
                  <div className="flex items-center gap-3 mb-3">
                    <StarRating value={myRating} onChange={setMyRating} size={22} />
                    <span className="text-[12px] text-gray-400">{myRating ? `${myRating}/5` : 'Tap to rate'}</span>
                  </div>
                  <textarea
                    rows={3}
                    value={myContent}
                    onChange={(e) => setMyContent(e.target.value)}
                    placeholder="Share your experience with this platform…"
                    className="w-full bg-bg border border-gray-200 rounded-xl p-3 text-[13px] outline-none focus:border-accent resize-none"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-[11px] text-gray-400">You can only leave one review per platform — it updates on re-submit.</div>
                    <button
                      onClick={submit}
                      disabled={myRating < 1 || submitting}
                      className="px-5 py-2 bg-accent hover:bg-accent-dk text-white font-bold text-[13px] rounded-full transition disabled:opacity-50 inline-flex items-center gap-1.5">
                      {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} /> : null}
                      Submit
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                <div className="px-5 py-3 border-b border-gray-100 text-[13px] font-extrabold">Reviews</div>
                {reviews.length === 0 ? (
                  <div className="text-center py-10 text-sm text-gray-400">
                    <Star className="w-6 h-6 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
                    Be the first to review {summary.platform.name}.
                  </div>
                ) : reviews.map((r) => (
                  <div key={r.id} className="px-5 py-4 border-b border-gray-50 last:border-0">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0">
                        {r.reviewer.avatarUrl
                          ? <img src={r.reviewer.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : (r.reviewer.displayName || '??').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-extrabold">{r.reviewer.displayName}</span>
                          <span className="text-[11px] text-gray-400">@{r.reviewer.handle}</span>
                          <span className="text-[11px] text-gray-300">· {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                        </div>
                        <div className="mt-1"><StarRating value={r.rating} size={13} /></div>
                        {r.content && <p className="text-[13px] text-gray-700 mt-2 leading-relaxed whitespace-pre-wrap">{r.content}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loadingSel && !summary && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center text-sm text-gray-400">
              Select a platform to see its reviews.
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
