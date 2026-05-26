'use client'
import { SkeletonConversation } from '@/components/Skeleton'
import { useEffect, useState, useRef } from 'react'
import { Link } from '@/lib/router-shim'
import { AlertTriangle, Crown } from 'lucide-react'
import { messageApi, profileApi, subscriptionApi, stripeApi } from '@/lib/api-client'
import { getSocket } from '@/lib/socket'
import { useAuthStore, useAppStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

const initials = (name) => name?.slice(0, 2).toUpperCase() || '??'

export default function MessagesPage() {
  const { profile } = useAuthStore()
  const { showToast } = useAppStore()
  const [conversations, setConversations] = useState([])
  const [activeConvo, setActiveConvo] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewDM, setShowNewDM] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [subInfo, setSubInfo] = useState(null)
  const [upgrading, setUpgrading] = useState(false)
  const messagesEndRef = useRef(null)

  const refreshSub = () => subscriptionApi.me().then(setSubInfo).catch(() => {})

  useEffect(() => { refreshSub() }, [])

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })

  const fetchConversations = async () => {
    if (!profile) return
    try {
      const data = await messageApi.conversations()
      setConversations(data || [])
    } catch (err) {
      showToast(err.message || 'Could not load conversations', 'error')
    }
    setLoading(false)
  }

  const fetchMessages = async (partnerId) => {
    if (!profile) return
    try {
      const { items } = await messageApi.with(partnerId, undefined, 50)
      setMessages(items || [])
      try { await messageApi.markRead(partnerId) } catch { /* non-fatal */ }
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      showToast(err.message || 'Could not load messages', 'error')
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConvo || sending) return
    setSending(true)
    try {
      await messageApi.send(activeConvo.partner.id, newMessage.trim())
      setNewMessage('')
      // Socket.IO will push `message:new` back; we'll pick it up and append
      refreshSub()
    } catch (err) {
      if (err.code === 'MESSAGE_LIMIT_REACHED') {
        showToast('Daily message limit reached — upgrade for unlimited', 'error')
        refreshSub()
      } else {
        showToast(err.message || 'Could not send', 'error')
      }
    }
    setSending(false)
  }

  const startUpgrade = async (plan = 'pro', billing = 'monthly') => {
    setUpgrading(true)
    try {
      const { url } = await stripeApi.checkout({ plan, billing })
      if (url) { window.location.href = url; return }
      showToast('Checkout URL missing', 'error')
    } catch (err) {
      if (err.code === 'STRIPE_DISABLED' || err.code === 'PRICE_MISSING') {
        showToast('Payments are not set up yet. Check back soon!', 'error')
      } else showToast(err.message || 'Checkout failed', 'error')
    }
    setUpgrading(false)
  }

  const searchPeople = async (q) => {
    if (!q.trim()) { setSearchResults([]); return }
    try {
      const results = await profileApi.search(q, 10)
      setSearchResults(results || [])
    } catch {
      setSearchResults([])
    }
  }

  const startNewDM = (p) => {
    setActiveConvo({ partner: p, lastMessage: null, unreadCount: 0 })
    setShowNewDM(false)
    setSearchResults([])
    fetchMessages(p.id)
  }

  useEffect(() => { fetchConversations() }, [profile])

  useEffect(() => {
    if (!activeConvo) return
    fetchMessages(activeConvo.partner.id)
  }, [activeConvo?.partner?.id])

  // Socket.IO realtime — listen for new messages + read receipts
  useEffect(() => {
    if (!profile) return
    const sock = getSocket()
    if (!sock) return

    const onNew = (msg) => {
      const iAmRecipient = msg.receiverId === profile.id
      const iAmSender = msg.senderId === profile.id
      const partnerId = iAmRecipient ? msg.senderId : msg.receiverId
      const activePartner = activeConvo?.partner?.id
      const inActiveConvo = activePartner && partnerId === activePartner

      if (inActiveConvo) {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]))
        setTimeout(scrollToBottom, 50)
        // Mark this new message as read immediately since user is looking at it
        if (iAmRecipient) messageApi.markRead(partnerId).catch(() => {})
      }
      // Refresh conversation list (updates last message + unread counts)
      fetchConversations()
      void iAmSender
    }

    const onRead = () => {
      // Conversation list updates unread counters on re-fetch
      fetchConversations()
    }

    sock.on('message:new', onNew)
    sock.on('message:read', onRead)
    return () => {
      sock.off('message:new', onNew)
      sock.off('message:read', onRead)
    }
  }, [profile?.id, activeConvo?.partner?.id])

  const filtered = conversations.filter(c => c.partner.displayName?.toLowerCase().includes(searchQuery.toLowerCase()))

  const quota = subInfo?.dailyMessageQuota
  const showQuotaBanner = subInfo && !subInfo.unlimitedMessages && quota
  const bannerTone = quota && quota.remaining === 0 ? 'danger' : 'info'

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      {showQuotaBanner && (
        <div className={`mb-3 flex items-center gap-3 px-4 py-3 rounded-xl border
          ${bannerTone === 'danger'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
          <div className="flex-1 text-[12.5px] font-semibold">
            {bannerTone === 'danger'
              ? 'Free plan: you can DM up to 2 new creators per day. Upgrade to message anyone.'
              : `${quota.remaining} of ${quota.limit} new creators left to DM today on the Free plan.`}
          </div>
          <button
            onClick={() => startUpgrade('pro', 'monthly')}
            disabled={upgrading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-[11.5px] font-bold rounded-full transition disabled:opacity-50">
            <Crown className="w-3.5 h-3.5" strokeWidth={2.5} />
            Upgrade
          </button>
          <Link to="/pricing" className="text-[11.5px] font-semibold underline hover:no-underline">See plans</Link>
        </div>
      )}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex" style={{ height: 'calc(100dvh - 130px)' }}>

        {/* LEFT sidebar */}
        <div className="w-full md:w-[300px] border-r border-gray-100 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[16px] font-extrabold">Messages</h2>
              <button onClick={() => setShowNewDM(true)} className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold hover:bg-accent-dk transition">+</button>
            </div>
            <input type="text" placeholder="🔍 Search…"
              className="w-full h-9 bg-bg border border-gray-200 rounded-full px-4 text-[12.5px] outline-none focus:border-accent"
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
              : loading && filtered.length === 0 ? Array(5).fill(0).map((_, i) => <SkeletonConversation key={i} />)
            :  filtered.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="text-3xl mb-2">💬</div>
                  <div className="text-sm font-bold text-gray-600 mb-1">No messages yet</div>
                  <div className="text-xs text-gray-400">Click + to start a conversation</div>
                </div>
              ) : filtered.map(convo => (
                <div key={convo.partner.id} onClick={() => setActiveConvo(convo)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50
                    ${activeConvo?.partner.id === convo.partner.id ? 'bg-accent-lt border-l-[3px] border-l-accent' : ''}`}>
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-sm">{initials(convo.partner.displayName)}</div>
                    {convo.partner.isLive && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-live rounded-full border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className={`text-[13px] truncate ${convo.unreadCount > 0 ? 'font-extrabold' : 'font-semibold'}`}>{convo.partner.displayName}</span>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{convo.lastMessage?.createdAt ? formatDistanceToNow(new Date(convo.lastMessage.createdAt)) : ''}</span>
                    </div>
                    <div className={`text-[11.5px] truncate ${convo.unreadCount > 0 ? 'text-gray-700 font-semibold' : 'text-gray-400'}`}>{convo.lastMessage?.content}</div>
                  </div>
                  {convo.unreadCount > 0 && <div className="w-5 h-5 bg-accent rounded-full text-white text-[9px] font-black flex items-center justify-center flex-shrink-0">{convo.unreadCount}</div>}
                </div>
              ))}
          </div>
        </div>

        {/* RIGHT chat */}
        {activeConvo ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-sm">{initials(activeConvo.partner.displayName)}</div>
              <div>
                <div className="text-[14px] font-extrabold">{activeConvo.partner.displayName}</div>
                <div className="text-[11px] text-gray-400">@{activeConvo.partner.handle} {activeConvo.partner.isLive && <span className="text-live font-bold ml-1">● LIVE</span>}</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-3xl mb-2">👋</div>
                  <div className="text-sm text-gray-400">Say hi to {activeConvo.partner.displayName}!</div>
                </div>
              )}
              {messages.map(msg => {
                const isMe = msg.senderId === profile?.id
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-[13.5px] leading-relaxed
                      ${isMe ? 'bg-accent text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                      {msg.content}
                      <div className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                        {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
              <input type="text" placeholder={`Message ${activeConvo.partner.displayName}…`}
                className="flex-1 h-10 bg-bg border border-gray-200 rounded-full px-4 text-[13px] outline-none focus:border-accent focus:bg-white transition"
                value={newMessage} onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()} />
              <button onClick={sendMessage} disabled={!newMessage.trim() || sending}
                className="w-10 h-10 bg-accent text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-accent-dk transition text-base">➤</button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-3">
            <div className="text-5xl">💬</div>
            <div className="text-lg font-extrabold text-gray-700">Your Messages</div>
            <div className="text-sm text-gray-400">Select a conversation or start a new one</div>
            <button onClick={() => setShowNewDM(true)} className="mt-2 px-5 py-2 bg-accent text-white font-bold rounded-full text-sm hover:bg-accent-dk transition">+ New Message</button>
          </div>
        )}
      </div>

      {/* New DM modal */}
      {showNewDM && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowNewDM(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-[16px]">New Message</h3>
              <button onClick={() => setShowNewDM(false)} className="text-gray-400 hover:text-gray-700 text-xl">✕</button>
            </div>
            <input type="text" placeholder="🔍 Search streamers…"
              className="w-full h-10 bg-bg border border-gray-200 rounded-full px-4 text-sm outline-none focus:border-accent mb-3"
              onChange={e => searchPeople(e.target.value)} />
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {searchResults.map(p => (
                <div key={p.id} onClick={() => startNewDM(p)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-xs">{initials(p.displayName)}</div>
                  <div>
                    <div className="text-[13px] font-bold">{p.displayName}</div>
                    <div className="text-[11px] text-gray-400">@{p.handle}{p.category ? ` · ${p.category}` : ''}</div>
                  </div>
                </div>
              ))}
              {searchResults.length === 0 && <div className="text-center py-4 text-sm text-gray-400">Type to search for streamers</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
