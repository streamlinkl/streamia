'use client'
import { useEffect, useState } from 'react'
import { Bell, BadgeCheck, Heart, MessageSquare, Handshake, UserPlus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { notificationApi } from '@/lib/api-client'

const TYPE_META = {
  connection_request:  { Icon: Handshake,    color: 'text-violet-500',  text: 'wants to connect' },
  connection_accepted: { Icon: BadgeCheck,   color: 'text-emerald-500', text: 'accepted your connection request' },
  follow:              { Icon: UserPlus,     color: 'text-blue-500',    text: 'followed you' },
  message:             { Icon: MessageSquare, color: 'text-gray-700',   text: 'sent you a message' },
  post_like:           { Icon: Heart,        color: 'text-rose-500',    text: 'liked your post' },
  admin:               { Icon: BadgeCheck,   color: 'text-amber-500',   text: '' },
}

export default function NotificationsPage() {
  const [items, setItems] = useState([])
  const [cursor, setCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    notificationApi.list({ limit: 30 }).then((d) => {
      if (cancelled) return
      setItems(d.items || [])
      setCursor(d.nextCursor || null)
      setDone(!d.nextCursor)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const loadMore = async () => {
    if (!cursor || loadingMore) return
    setLoadingMore(true)
    try {
      const d = await notificationApi.list({ cursor, limit: 30 })
      setItems((prev) => [...prev, ...(d.items || [])])
      setCursor(d.nextCursor || null)
      setDone(!d.nextCursor)
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="max-w-[720px] mx-auto px-4 py-5">
      <h1 className="inline-flex items-center gap-2 text-[22px] font-extrabold tracking-tight mb-4">
        <Bell className="w-5 h-5" strokeWidth={2.5} />
        Notifications
      </h1>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-10"><div className="w-7 h-7 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-14">
            <Bell className="w-7 h-7 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
            <div className="font-bold text-gray-600">No notifications yet</div>
            <div className="text-sm text-gray-400 mt-1">Your activity will show up here.</div>
          </div>
        ) : (
          items.map((n) => {
            const meta = TYPE_META[n.type] || { Icon: Bell, color: 'text-gray-500', text: n.type }
            const name = n.actor?.displayName || 'Someone'
            return (
              <div key={n.id} className={`flex items-start gap-3 px-5 py-4 border-b border-gray-50 last:border-0 ${n.readAt ? '' : 'bg-accent-lt/30'}`}>
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-400 text-white font-bold text-xs flex items-center justify-center overflow-hidden">
                    {n.actor?.avatarUrl
                      ? <img src={n.actor.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center ${meta.color}`}>
                    <meta.Icon className="w-2.5 h-2.5" strokeWidth={2.5} fill="currentColor" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] leading-snug">
                    <span className="font-extrabold">{name}</span>{' '}
                    <span className="text-gray-600">{meta.text}</span>
                  </div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                </div>
              </div>
            )
          })
        )}
      </div>
      {!done && !loading && (
        <div className="text-center mt-4">
          <button onClick={loadMore} disabled={loadingMore}
            className="px-5 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-[12.5px] rounded-full hover:border-gray-400 transition disabled:opacity-50">
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
