import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bell, BadgeCheck, Eye, Heart, MessageSquare, Handshake, UserPlus } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { notificationApi } from '@/lib/api'
import { getSocket } from '@/lib/socket'

const TYPE_META = {
  connection_request:  { Icon: Handshake,   color: 'text-violet-500',  text: 'wants to connect' },
  connection_accepted: { Icon: BadgeCheck,  color: 'text-emerald-500', text: 'accepted your connection request' },
  follow:              { Icon: UserPlus,    color: 'text-blue-500',    text: 'followed you' },
  message:             { Icon: MessageSquare, color: 'text-gray-700',  text: 'sent you a message' },
  post_like:           { Icon: Heart,       color: 'text-rose-500',    text: 'liked your post' },
  profile_view:        { Icon: Eye,         color: 'text-indigo-500',  text: 'viewed your profile' },
  admin:               { Icon: BadgeCheck,  color: 'text-amber-500',   text: '' },
}

export default function NotificationBell() {
  const [count, setCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(null)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef(null)

  const refreshCount = useCallback(() => {
    notificationApi.unreadCount().then((r) => setCount(r?.count ?? 0)).catch(() => {})
  }, [])

  useEffect(() => { refreshCount() }, [refreshCount])

  // Socket.IO push
  useEffect(() => {
    const sock = getSocket()
    if (!sock) return
    const onNew = () => {
      setCount((c) => c + 1)
      if (open) loadItems()
    }
    sock.on('notification:new', onNew)
    return () => { sock.off('notification:new', onNew) }
  }, [open])

  // Outside click to close
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    window.addEventListener('mousedown', handler)
    return () => window.removeEventListener('mousedown', handler)
  }, [open])

  const loadItems = async () => {
    setLoading(true)
    try {
      const data = await notificationApi.list({ limit: 15 })
      setItems(data.items || [])
    } catch { setItems([]) }
    setLoading(false)
  }

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next) {
      await loadItems()
      try {
        const res = await notificationApi.markAllRead()
        if (res?.markedRead > 0) setCount(0)
      } catch {}
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition"
        aria-label="Notifications">
        <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
        {count > 0 && (
          <span className="absolute top-1 right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-live text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-[340px] max-w-[calc(100vw-20px)] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <span className="text-[13px] font-extrabold">Notifications</span>
            <Link to="/notifications" onClick={() => setOpen(false)}
              className="text-[11px] font-bold text-accent hover:underline">See all</Link>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {loading && !items ? (
              <div className="text-center py-8 text-sm text-gray-400">Loading…</div>
            ) : items && items.length === 0 ? (
              <div className="text-center py-10 text-sm text-gray-400">
                <Bell className="w-5 h-5 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
                You are all caught up.
              </div>
            ) : items && items.map((n) => {
              const meta = TYPE_META[n.type] || { Icon: Bell, color: 'text-gray-500', text: n.type }
              const name = n.actor?.displayName || 'Someone'
              return (
                <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 ${n.readAt ? '' : 'bg-accent-lt/40'}`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-400 text-white font-bold text-[10px] flex items-center justify-center overflow-hidden">
                      {n.actor?.avatarUrl
                        ? <img src={n.actor.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center ${meta.color}`}>
                      <meta.Icon className="w-2.5 h-2.5" strokeWidth={2.5} fill="currentColor" />
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] leading-snug">
                      <span className="font-extrabold">{name}</span>{' '}
                      <span className="text-gray-600">{meta.text}</span>
                    </div>
                    <div className="text-[10.5px] text-gray-400 mt-0.5">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
