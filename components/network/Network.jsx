'use client'
import { SkeletonProfile } from '@/components/Skeleton'
import { useEffect, useState } from 'react'
import { connectionApi, followApi, profileApi } from '@/lib/api-client'
import { useAuthStore, useAppStore } from '@/lib/store'

const TABS = ['Suggestions', 'Requests', 'Connections', 'Following']
const initials = (name) => name?.slice(0, 2).toUpperCase() || '??'
const gradients = ['from-accent to-purple-400','from-pink-500 to-rose-500','from-yellow-400 to-amber-500','from-green-500 to-emerald-600','from-cyan-500 to-blue-500','from-orange-500 to-red-500']

export default function Network() {
  const { profile } = useAuthStore()
  const { showToast } = useAppStore()
  const [tab, setTab] = useState('Suggestions')
  const [suggestions, setSuggestions] = useState([])
  const [requests, setRequests] = useState([])
  const [connections, setConnections] = useState([])
  const [following, setFollowing] = useState([])
  const [loading, setLoading] = useState(true)
  const dataCache = {}
  const [sent, setSent] = useState(new Set())

  const fetchAll = async () => {
    if (!profile) return
    setLoading(true)

    try {
      const [sugg, conns, follows] = await Promise.all([
        profileApi.suggestions(12),
        connectionApi.list(),
        followApi.myFollowing(undefined, 50),
      ])
      setSuggestions(sugg || [])
      setRequests(conns.pendingIncoming || [])
      setConnections(conns.accepted || [])
      setFollowing(follows.items || [])
    } catch (err) {
      showToast(err.message || 'Could not load network', 'error')
    } finally {
      setLoading(false)
    }
  }

  const sendRequest = async (toId) => {
    try {
      await connectionApi.create(toId)
      setSent(s => new Set([...s, toId]))
      showToast('✅ Connection request sent!')
    } catch (err) {
      if (err.code === 'CONNECTION_EXISTS') {
        setSent(s => new Set([...s, toId]))
        showToast('Already requested', 'error')
      } else {
        showToast(err.message || 'Could not send request', 'error')
      }
    }
  }

  const acceptRequest = async (connId, fromName) => {
    try {
      await connectionApi.respond(connId, 'accepted')
      showToast(`🎉 You're now connected with ${fromName}!`)
      fetchAll()
    } catch (err) {
      showToast(err.message || 'Could not accept', 'error')
    }
  }

  const declineRequest = async (connId) => {
    try {
      await connectionApi.respond(connId, 'declined')
      showToast('Request declined')
      fetchAll()
    } catch (err) {
      showToast(err.message || 'Could not decline', 'error')
    }
  }

  const unfollow = async (userId) => {
    try {
      await followApi.unfollow(userId)
      showToast('Unfollowed')
      fetchAll()
    } catch (err) {
      showToast(err.message || 'Could not unfollow', 'error')
    }
  }

  useEffect(() => { fetchAll() }, [profile])

  const counts = { Suggestions: suggestions.length, Requests: requests.length, Connections: connections.length, Following: following.length }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h1 className="text-[20px] font-extrabold mb-1">My Network</h1>
          <p className="text-sm text-gray-400">Connect with streamers, follow creators, grow your network</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`relative flex items-center gap-2 px-4 py-3.5 text-[13px] font-bold transition
                ${tab === t ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
              {t}
              {counts[t] > 0 && <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${t === 'Requests' ? 'bg-live text-white' : 'bg-gray-100 text-gray-500'}`}>{counts[t]}</span>}
              {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded" />}
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div> : (

            <>
              {/* SUGGESTIONS */}
              {tab === 'Suggestions' && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {suggestions.length === 0 && <div className="col-span-3 text-center py-12 text-gray-400">No suggestions right now</div>}
                  {suggestions.map((p, i) => (
                    <div key={p.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition">
                      <div className={`h-14 bg-gradient-to-r ${gradients[i % gradients.length]} opacity-20`} />
                      <div className="px-4 pb-4">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white font-extrabold -mt-6 border-[3px] border-white mb-2`}>
                          {initials(p.displayName)}
                        </div>
                        <div className="font-bold text-[13.5px]">{p.displayName}</div>
                        <div className="text-[11px] text-gray-400 mb-1">@{p.handle}</div>
                        {p.category && <div className="text-[11px] text-gray-500 mb-3">{p.category}</div>}
                        {p.platforms?.length > 0 && (
                          <div className="flex gap-1 mb-3 flex-wrap">
                            {p.platforms.includes('twitch')  && <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-bold">🟣 Twitch</span>}
                            {p.platforms.includes('kick')    && <span className="text-[10px] px-2 py-0.5 bg-green-50  text-green-700  rounded-full font-bold">🟢 Kick</span>}
                            {p.platforms.includes('youtube') && <span className="text-[10px] px-2 py-0.5 bg-red-50    text-red-700    rounded-full font-bold">🔴 YouTube</span>}
                          </div>
                        )}
                        <button
                          onClick={() => sendRequest(p.id)}
                          disabled={sent.has(p.id)}
                          className={`w-full h-8 rounded-full text-[12px] font-bold transition
                            ${sent.has(p.id) ? 'bg-gray-100 text-gray-400' : 'border border-accent text-accent hover:bg-accent hover:text-white'}`}>
                          {sent.has(p.id) ? '✓ Pending' : '+ Connect'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* REQUESTS */}
              {tab === 'Requests' && (
                <div className="space-y-3 max-w-2xl">
                  {requests.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">📭</div>
                      <div className="font-bold text-gray-600">No pending requests</div>
                      <div className="text-sm text-gray-400 mt-1">When someone wants to connect, it'll show here</div>
                    </div>
                  )}
                  {requests.map((req, i) => (
                    <div key={req.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white font-extrabold flex-shrink-0`}>
                        {initials(req.otherUser?.displayName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[14px]">{req.otherUser?.displayName}</div>
                        <div className="text-[11.5px] text-gray-400">@{req.otherUser?.handle}{req.otherUser?.category ? ` · ${req.otherUser.category}` : ''}</div>
                        {req.otherUser?.bio && <div className="text-[12px] text-gray-500 mt-1 line-clamp-1">{req.otherUser.bio}</div>}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button onClick={() => acceptRequest(req.id, req.otherUser?.displayName)}
                          className="px-4 py-1.5 bg-accent text-white font-bold text-[12px] rounded-full hover:bg-accent-dk transition">Accept</button>
                        <button onClick={() => declineRequest(req.id)}
                          className="px-4 py-1.5 border border-gray-200 text-gray-500 font-bold text-[12px] rounded-full hover:border-gray-400 transition">Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CONNECTIONS */}
              {tab === 'Connections' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                  {connections.length === 0 && (
                    <div className="col-span-2 text-center py-12">
                      <div className="text-4xl mb-3">🤝</div>
                      <div className="font-bold text-gray-600">No connections yet</div>
                      <div className="text-sm text-gray-400 mt-1">Go to Suggestions and send some requests!</div>
                    </div>
                  )}
                  {connections.map((conn, i) => {
                    const partner = conn.otherUser
                    if (!partner) return null
                    return (
                      <div key={conn.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                          {initials(partner.displayName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[13px]">{partner.displayName}</div>
                          <div className="text-[11px] text-gray-400">@{partner.handle}</div>
                        </div>
                        <button className="text-[12px] font-bold text-gray-400 hover:text-accent border border-gray-200 rounded-full px-3 py-1 hover:border-accent transition">
                          Message
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* FOLLOWING */}
              {tab === 'Following' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl">
                  {following.length === 0 && (
                    <div className="col-span-2 text-center py-12">
                      <div className="text-4xl mb-3">👀</div>
                      <div className="font-bold text-gray-600">Not following anyone yet</div>
                      <div className="text-sm text-gray-400 mt-1">Follow streamers from their profiles</div>
                    </div>
                  )}
                  {following.map((f, i) => (
                    <div key={f.id} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition">
                      <div className="relative flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center text-white font-bold text-sm`}>
                          {initials(f.displayName)}
                        </div>
                        {f.isLive && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-live rounded-full border-2 border-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[13px]">{f.displayName}</div>
                        <div className="text-[11px] text-gray-400">@{f.handle}</div>
                      </div>
                      <button onClick={() => unfollow(f.id)} className="text-[11px] font-bold text-gray-400 hover:text-red-500 border border-gray-200 rounded-full px-3 py-1 transition">Unfollow</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
