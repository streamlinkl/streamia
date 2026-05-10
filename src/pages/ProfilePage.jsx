import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  BadgeCheck, BarChart3, Check, Clock, Eye, FileText, Handshake, Heart, MapPin,
  MessageCircle, Pencil, Plus, Radio, Rocket, TrendingUp, Users, X,
} from 'lucide-react'
import { connectionApi, followApi, postApi, profileApi } from '@/lib/api'
import { useAuthStore, useAppStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import ImageUpload from '@/components/ui/ImageUpload'
import PlatformPicker from '@/components/ui/PlatformPicker'
import { COUNTRIES, LANGUAGES } from '@/lib/countries'

const TABS = ['Posts', 'Schedule', 'Stats']

const SCHEDULE = [
  { day: 'Monday',    time: '8:00 PM', game: 'Valorant Ranked',      duration: '4h', platform: 'twitch' },
  { day: 'Wednesday', time: '7:00 PM', game: 'Just Chatting + Games', duration: '3h', platform: 'twitch' },
  { day: 'Friday',    time: '9:00 PM', game: 'New Release Friday',    duration: '5h', platform: 'kick' },
  { day: 'Saturday',  time: '3:00 PM', game: 'Subscriber Stream',     duration: '6h', platform: 'twitch' },
  { day: 'Sunday',    time: '5:00 PM', game: 'Chill Variety Stream',  duration: '4h', platform: 'youtube' },
]
const PLATFORM_DOT = { twitch: 'bg-purple-500', kick: 'bg-green-500', youtube: 'bg-red-500' }

export default function ProfilePage() {
  const { id } = useParams()
  const { profile: myProfile, fetchProfile } = useAuthStore()
  const { showToast } = useAppStore()
  const [profile, setProfile] = useState(null)
  const [posts, setPosts] = useState([])
  const [tab, setTab] = useState('Posts')
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [showConnections, setShowConnections] = useState(false)
  const [connectionsList, setConnectionsList] = useState(null)

  const isOwnProfile = !id || id === myProfile?.id

  useEffect(() => {
    const targetId = id || myProfile?.id
    if (!targetId) {
      // Keep "loading" true while auth is still bootstrapping; once we know
      // we have neither an :id param nor a logged-in profile, we have nothing
      // to load — bail out of the spinner so the user sees an empty state.
      if (!id && myProfile === null) setLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const p = isOwnProfile ? await profileApi.me() : await profileApi.get(targetId)
        if (cancelled) return
        setProfile(p)
        setEditForm({
          displayName: p?.displayName || '',
          handle: p?.handle || '',
          firstName: p?.firstName || '',
          lastName: p?.lastName || '',
          country: p?.country || '',
          language: p?.language || 'en',
          bio: p?.bio || '',
          category: p?.category || '',
          location: p?.location || '',
          website: p?.website || '',
          twitchUrl: p?.twitchUrl || '',
          kickUrl: p?.kickUrl || '',
          youtubeUrl: p?.youtubeUrl || '',
          platforms: p?.platforms || [],
          contentCategories: p?.contentCategories || [],
          avatarUrl: p?.avatarUrl || '',
          bannerUrl: p?.bannerUrl || '',
          liveStreamUrl: p?.liveStreamUrl || '',
        })
        setIsFollowing(Boolean(p?.isFollowing))
        setIsConnected(p?.connectionStatus === 'accepted')

        const postsResult = await postApi.byUser(targetId, undefined, 50)
        if (cancelled) return
        setPosts(postsResult.items || [])

        // Track this as a profile view (idempotent per day server-side).
        if (!isOwnProfile) {
          profileApi.recordView(targetId).catch(() => {})
        }
      } catch (err) {
        if (!cancelled) showToast(err.message || 'Could not load profile', 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, myProfile?.id, isOwnProfile])

  const saveProfile = async () => {
    setSaving(true)
    try {
      // Trim empty strings to null so blanks actually clear values
      const patch = Object.fromEntries(
        Object.entries(editForm).map(([k, v]) => [k, v === '' ? null : v])
      )
      const updated = await profileApi.updateMe(patch)
      showToast('Profile updated')
      setShowEdit(false)
      await fetchProfile()
      setProfile(updated)
    } catch (err) {
      if (err.code === 'HANDLE_TAKEN') showToast('That handle is already taken', 'error')
      else showToast(err.message || 'Could not save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleFollow = async () => {
    if (!myProfile) return
    try {
      if (isFollowing) {
        await followApi.unfollow(profile.id)
        setIsFollowing(false); showToast('Unfollowed')
      } else {
        await followApi.follow(profile.id)
        setIsFollowing(true); showToast(`Following ${profile.displayName}`)
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error')
    }
  }

  const openConnectionsModal = async () => {
    if (connectionsList) return
    try {
      const list = await profileApi.connections(profile.id, 200)
      setConnectionsList(list || [])
    } catch (err) {
      showToast(err.message || 'Failed to load connections', 'error')
      setConnectionsList([])
    }
  }

  const handleConnect = async () => {
    if (!myProfile || isConnected) return
    try {
      await connectionApi.create(profile.id)
      setIsConnected(true); showToast('Connection request sent')
    } catch (err) {
      if (err.code === 'CONNECTION_EXISTS') showToast('Already connected or pending', 'error')
      else showToast(err.message || 'Could not send request', 'error')
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
  if (!profile) return <div className="text-center py-20 text-gray-400">Profile not found</div>

  const initials = profile.displayName?.slice(0, 2).toUpperCase() || '??'
  const statCards = [
    { label: 'Posts', value: posts.length },
    { label: 'Connections', value: profile.connectionsCount || 0 },
    { label: 'Followers', value: profile.followersCount || 0 },
    { label: 'Collabs', value: 0 },
  ]

  return (
    <div className="max-w-[900px] mx-auto px-4 py-5">
      {isOwnProfile && (
        <Link
          to="/profile-views"
          className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 mb-4 hover:border-accent transition group">
          <div className="w-9 h-9 bg-accent-lt rounded-full flex items-center justify-center flex-shrink-0">
            <Eye className="w-4 h-4 text-accent" strokeWidth={2.25} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-extrabold">Who viewed your profile</div>
            <div className="text-[11.5px] text-gray-400">See your viewers from the last 90 days · upgrade to unlock identities</div>
          </div>
          <span className="text-[11px] font-bold text-accent group-hover:translate-x-0.5 transition">View →</span>
        </Link>
      )}

      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-4">
        <div className="relative h-44 bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200">
          {profile.bannerUrl && (
            <img src={profile.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
        </div>
        <div className="px-6 pb-5">
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-extrabold text-2xl">
                {profile.avatarUrl
                  ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : initials}
              </div>
              {profile.isLive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-live text-white text-[9.5px] font-black px-2 py-0.5 rounded-full border-2 border-white">LIVE</div>
              )}
            </div>
            <div className="flex gap-2 pb-1">
              {isOwnProfile ? (
                <>
                  <button onClick={() => setShowEdit(true)} className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full text-[13px] font-bold hover:border-gray-400 transition">
                    <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} /> Edit Profile
                  </button>
                  <button onClick={async () => {
                    if (profile.isLive) {
                      try { const updated = await profileApi.setLive(false, null); setProfile(updated); showToast('Marked as offline') } catch (err) { showToast(err.message || 'Failed', 'error') }
                      return
                    }
                    const url = window.prompt('Paste your live stream URL (Twitch/Kick/YouTube/etc.):', profile.liveStreamUrl || profile.twitchUrl || profile.kickUrl || profile.youtubeUrl || '')
                    if (!url) return
                    try { const updated = await profileApi.setLive(true, url.trim()); setProfile(updated); showToast('You are now live') } catch (err) { showToast(err.message || 'Failed to go live', 'error') }
                  }} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition ${profile.isLive ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-live text-white hover:opacity-90'}`}>
                    <Radio className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {profile.isLive ? 'End Stream' : 'Go Live'}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleFollow} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition ${isFollowing ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'border border-accent text-accent hover:bg-accent hover:text-white'}`}>
                    {isFollowing
                      ? <><Check className="w-3.5 h-3.5" strokeWidth={3} /> Following</>
                      : <><Plus className="w-3.5 h-3.5" strokeWidth={3} /> Follow</>}
                  </button>
                  <button onClick={handleConnect} disabled={isConnected} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition ${isConnected ? 'bg-gray-100 text-gray-500' : 'bg-accent text-white hover:bg-accent-dk'}`}>
                    {isConnected
                      ? <><Check className="w-3.5 h-3.5" strokeWidth={3} /> Connected</>
                      : <><Handshake className="w-3.5 h-3.5" strokeWidth={2.5} /> Connect</>}
                  </button>
                </>
              )}
            </div>
          </div>

          <h1 className="text-[20px] font-extrabold">{profile.displayName}</h1>
          <div className="flex items-center flex-wrap gap-x-1.5 text-[13px] text-gray-400 mb-2">
            <span>@{profile.handle}</span>
            {profile.category && <span>· {profile.category}</span>}
            {profile.location && (
              <span className="inline-flex items-center gap-1">
                · <MapPin className="w-3 h-3" strokeWidth={2.5} /> {profile.location}
              </span>
            )}
          </div>
          {profile.bio && <p className="text-[13.5px] text-gray-600 leading-relaxed mb-3 max-w-xl">{profile.bio}</p>}

          {profile.contentCategories?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {profile.contentCategories.map((cat) => (
                <span key={cat} className="inline-flex items-center px-2.5 py-1 bg-pink-50 text-pink-700 rounded-full text-[11px] font-bold">{cat}</span>
              ))}
            </div>
          )}

          {/* Platform badges */}
          {profile.platforms?.length > 0 && (
            <div className="flex gap-2 mb-3 flex-wrap">
              {profile.platforms.includes('twitch')  && <a href={profile.twitchUrl || '#'} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-[12px] font-bold hover:bg-purple-100 transition">🟣 Twitch</a>}
              {profile.platforms.includes('kick')    && <a href={profile.kickUrl || '#'}   className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50  text-green-700  rounded-full text-[12px] font-bold hover:bg-green-100  transition">🟢 Kick</a>}
              {profile.platforms.includes('youtube') && <a href={profile.youtubeUrl || '#'} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50    text-red-700    rounded-full text-[12px] font-bold hover:bg-red-100    transition">🔴 YouTube</a>}
            </div>
          )}

          {/* Stats row */}
          <div className="flex border-t border-gray-100 -mx-6 mt-3">
            {statCards.map(s => {
              const isClickable = s.label === 'Connections' && (profile.connectionsCount ?? 0) > 0
              const base = 'flex-1 text-center py-3 border-r border-gray-100 last:border-0 transition'
              const content = (
                <>
                  <div className="text-[17px] font-extrabold">{s.value}</div>
                  <div className="text-[10.5px] text-gray-400 font-semibold">{s.label}</div>
                </>
              )
              return isClickable
                ? (
                  <button
                    key={s.label}
                    onClick={() => { setShowConnections(true); openConnectionsModal() }}
                    className={`${base} cursor-pointer hover:bg-accent-lt/60 focus:outline-none`}>
                    {content}
                  </button>
                )
                : (
                  <div key={s.label} className={`${base} cursor-default`}>
                    {content}
                  </div>
                )
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 px-5">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`relative px-5 py-3.5 text-[13px] font-bold transition ${tab === t ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
              {t}
              {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded" />}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* POSTS */}
          {tab === 'Posts' && (
            <div className="space-y-3">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" strokeWidth={1.75} />
                  <div className="font-bold text-gray-600">{isOwnProfile ? "You haven't posted yet" : "No posts yet"}</div>
                  <div className="text-sm text-gray-400 mt-1">{isOwnProfile ? "Share your first post from the Feed." : "Check back later."}</div>
                </div>
              ) : posts.map(post => (
                <div key={post.id} className="border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition">
                  <p className="text-[13.5px] text-gray-700 leading-relaxed">{post.content}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <div className="flex gap-4 text-[12px] text-gray-400">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" strokeWidth={2.5} /> {post.likesCount || 0}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="w-3.5 h-3.5" strokeWidth={2.5} /> {post.commentsCount || 0}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SCHEDULE */}
          {tab === 'Schedule' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-[15px]">Stream Schedule</h3>
                {isOwnProfile && <button onClick={() => showToast('Schedule editor coming soon')} className="text-[12.5px] font-bold text-accent hover:underline">Edit Schedule</button>}
              </div>
              {SCHEDULE.map((s, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-accent hover:bg-accent-lt transition">
                  <div className="text-center w-16 flex-shrink-0">
                    <div className="text-[11px] font-extrabold text-accent uppercase">{s.day.slice(0, 3)}</div>
                    <div className="text-[12.5px] font-bold text-gray-700">{s.time}</div>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-bold">{s.game}</div>
                    <div className="flex items-center gap-1.5 text-[11.5px] text-gray-400 mt-0.5">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${PLATFORM_DOT[s.platform] || 'bg-gray-400'}`} />
                      <span className="capitalize">{s.platform}</span>
                      <span>· {s.duration}</span>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 text-[11px] text-gray-300">
                    <Clock className="w-3 h-3" strokeWidth={2.5} /> {s.duration}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STATS */}
          {tab === 'Stats' && (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Avg Viewers',    value: '3,240',   Icon: Eye,         color: 'text-accent',     bg: 'bg-accent-lt' },
                  { label: 'Peak Viewers',   value: '12,890',  Icon: Rocket,      color: 'text-green-600',  bg: 'bg-green-50' },
                  { label: 'Hours Streamed', value: '487h',    Icon: Clock,       color: 'text-blue-500',   bg: 'bg-blue-50' },
                  { label: 'Total Followers', value: profile.followersCount > 0 ? profile.followersCount.toLocaleString() : '—',
                    Icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
                ].map(s => (
                  <div key={s.label} className="border border-gray-200 rounded-xl p-4 text-center">
                    <div className={`w-9 h-9 ${s.bg} rounded-full flex items-center justify-center mx-auto mb-1.5`}>
                      <s.Icon className={`w-4 h-4 ${s.color}`} strokeWidth={2.25} />
                    </div>
                    <div className={`text-[22px] font-extrabold ${s.color}`}>{s.value}</div>
                    <div className="text-[11.5px] text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="inline-flex items-center justify-center gap-2 w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-[13px] text-gray-500">
                <BarChart3 className="w-4 h-4 text-gray-400" strokeWidth={2.25} />
                Connect your streaming platforms to show live stats here
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Connections modal */}
      {showConnections && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowConnections(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-[15px] font-extrabold">{profile.displayName} · {profile.connectionsCount || 0} connections</h3>
              <button onClick={() => setShowConnections(false)} aria-label="Close" className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {connectionsList === null ? (
                <div className="flex justify-center py-10"><div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
              ) : connectionsList.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-400">No connections yet.</div>
              ) : connectionsList.map(({ connectionId, profile: p }) => (
                <Link key={connectionId} to={`/profile/${p.id}`}
                  onClick={() => setShowConnections(false)}
                  className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-400 text-white font-bold text-xs flex items-center justify-center overflow-hidden flex-shrink-0">
                    {p.avatarUrl
                      ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : (p.displayName || '??').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13.5px] font-extrabold truncate">{p.displayName}</span>
                      {p.isVerified && <BadgeCheck className="w-4 h-4 text-sky-500 flex-shrink-0" fill="currentColor" strokeWidth={0} />}
                      {p.isLive && <span className="text-[9.5px] bg-live text-white font-black px-1.5 py-0.5 rounded-full">LIVE</span>}
                    </div>
                    <div className="text-[11.5px] text-gray-400 truncate">@{p.handle}{p.category ? ` · ${p.category}` : ''}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowEdit(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[17px] font-extrabold">Edit Profile</h3>
              <button onClick={() => setShowEdit(false)} aria-label="Close" className="text-gray-400 hover:text-gray-700 transition">
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11.5px] font-bold text-gray-500 mb-1">First name</label>
                  <input type="text" placeholder="Jordan"
                    className="w-full h-9 bg-bg border border-gray-200 rounded-lg px-3 text-[13px] outline-none focus:border-accent"
                    value={editForm.firstName || ''} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-gray-500 mb-1">Last name</label>
                  <input type="text" placeholder="Rivera"
                    className="w-full h-9 bg-bg border border-gray-200 rounded-lg px-3 text-[13px] outline-none focus:border-accent"
                    value={editForm.lastName || ''} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} />
                </div>
              </div>
              {[
                { key: 'displayName', label: 'Display Name', placeholder: 'Your name' },
                { key: 'handle', label: 'Handle', placeholder: 'yourhandle' },
                { key: 'category', label: 'Category', placeholder: 'e.g. FPS, Just Chatting' },
                { key: 'location', label: 'Location', placeholder: 'City' },
                { key: 'website', label: 'Website', placeholder: 'https://yoursite.com' },
                { key: 'twitchUrl', label: 'Twitch URL', placeholder: 'https://twitch.tv/you' },
                { key: 'kickUrl', label: 'Kick URL', placeholder: 'https://kick.com/you' },
                { key: 'youtubeUrl', label: 'YouTube URL', placeholder: 'https://youtube.com/@you' },
                { key: 'liveStreamUrl', label: 'Live stream URL (used by Go Live button)', placeholder: 'https://twitch.tv/you' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-[11.5px] font-bold text-gray-500 mb-1">{field.label}</label>
                  <input type="text" placeholder={field.placeholder}
                    className="w-full h-9 bg-bg border border-gray-200 rounded-lg px-3 text-[13px] outline-none focus:border-accent"
                    value={editForm[field.key] || ''} onChange={e => setEditForm({ ...editForm, [field.key]: e.target.value })} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11.5px] font-bold text-gray-500 mb-1">Country</label>
                  <select
                    className="w-full h-9 bg-bg border border-gray-200 rounded-lg px-2 text-[13px] outline-none focus:border-accent"
                    value={editForm.country || ''}
                    onChange={e => setEditForm({ ...editForm, country: e.target.value || null })}
                  >
                    <option value="">—</option>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11.5px] font-bold text-gray-500 mb-1">Language</label>
                  <select
                    className="w-full h-9 bg-bg border border-gray-200 rounded-lg px-2 text-[13px] outline-none focus:border-accent"
                    value={editForm.language || 'en'}
                    onChange={e => setEditForm({ ...editForm, language: e.target.value })}
                  >
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[11.5px] font-bold text-gray-500 mb-1.5">Streaming Platforms</label>
                <PlatformPicker
                  value={editForm.platforms || []}
                  onChange={(slugs) => setEditForm({ ...editForm, platforms: slugs })}
                />
              </div>
              {(profile?.contentCategories?.length > 0 || editForm.contentCategories?.length > 0) && (
                <div>
                  <label className="block text-[11.5px] font-bold text-gray-500 mb-1.5">Content niches</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['Fashion & Style','Beauty','Fitness & Wellness','Lifestyle','Travel','Food & Drinks','Tech & AI','Finance & Business','Entertainment','Gaming','Education / Niche Knowledge','Dating & Relationships','Adult Content'].map((cat) => {
                      const active = (editForm.contentCategories || []).includes(cat)
                      return (
                        <button key={cat} type="button"
                          onClick={() => setEditForm((f) => ({
                            ...f,
                            contentCategories: active
                              ? f.contentCategories.filter((c) => c !== cat)
                              : [...(f.contentCategories || []), cat]
                          }))}
                          className={`text-left py-1.5 px-2.5 rounded-lg border text-[11px] font-bold transition
                            ${active ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                          {cat}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-[11.5px] font-bold text-gray-500 mb-1">Bio</label>
                <textarea rows={3} placeholder="Tell your story…"
                  className="w-full bg-bg border border-gray-200 rounded-lg p-2.5 text-[13px] outline-none focus:border-accent resize-none"
                  value={editForm.bio || ''} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} />
              </div>
              <div>
                <label className="block text-[11.5px] font-bold text-gray-500 mb-1.5">Avatar</label>
                <ImageUpload
                  kind="avatar"
                  value={editForm.avatarUrl || ''}
                  onChange={(url) => setEditForm({ ...editForm, avatarUrl: url })}
                  label="Upload avatar"
                />
              </div>
              <div>
                <label className="block text-[11.5px] font-bold text-gray-500 mb-1.5">Banner</label>
                <ImageUpload
                  kind="banner"
                  value={editForm.bannerUrl || ''}
                  onChange={(url) => setEditForm({ ...editForm, bannerUrl: url })}
                  label="Upload banner"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={saveProfile} disabled={saving} className="flex-1 h-10 bg-accent hover:bg-accent-dk text-white font-bold rounded-full disabled:opacity-50 transition">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button onClick={() => setShowEdit(false)} className="px-5 border border-gray-200 rounded-full text-[13px] font-semibold text-gray-500 hover:border-gray-400 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
