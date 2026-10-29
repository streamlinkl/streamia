'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  BarChart3, Bookmark, Camera, Check, Clock, Eye, FileText, Handshake,
  Loader2, MapPin, Pencil, Plus, Radio, Rocket, Users, X,
} from 'lucide-react'
import { connectionApi, favoritesApi, followApi, platformApi, postApi, profileApi, uploadFile } from '@/lib/api-client'
import { useAuthStore, useAppStore } from '@/lib/store'
import RoleBadge from '@/components/RoleBadge'
import PostCard from '@/components/feed/PostCard'
import PremiumBadge from '@/components/PremiumBadge'

const ImageCropModal = dynamic(() => import('@/components/ImageCropModal'), { ssr: false })

const CROP_SPEC = {
  avatar: { aspect: 1, outputSize: { width: 512, height: 512 }, title: 'Adjust your profile photo' },
  banner: { aspect: 3, outputSize: { width: 1500, height: 500 }, title: 'Adjust your cover photo' },
}

function StreamStatusPill({ profile, setProfile }) {
  const { showToast } = useAppStore()
  const [busy, setBusy] = useState(false)
  const isLive = Boolean(profile.isLive)

  const toggle = async () => {
    if (busy) return
    setBusy(true)
    try {
      if (isLive) {
        const updated = await profileApi.setLive(false, null)
        setProfile((p) => ({ ...(p ?? {}), ...updated }))
        showToast('Stream ended')
      } else {
        const fallback = profile.liveStreamUrl || profile.twitchUrl || profile.kickUrl || profile.youtubeUrl || ''
        const url = window.prompt('Where are you streaming? Paste your live URL:', fallback)
        if (!url) return
        const updated = await profileApi.setLive(true, url.trim())
        setProfile((p) => ({ ...(p ?? {}), ...updated }))
        showToast('You are now live')
      }
    } catch (err) {
      showToast(err.message || 'Could not update stream status', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="inline-flex items-center gap-2 mb-2">
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border
        ${isLive ? 'bg-live/10 text-live border-live/30' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-live animate-pulse' : 'bg-gray-400'}`} />
        {isLive ? 'LIVE NOW' : 'Offline'}
      </div>
      <button onClick={toggle} disabled={busy}
        className={`inline-flex items-center gap-1 text-[11.5px] font-bold transition disabled:opacity-50
          ${isLive ? 'text-gray-500 hover:text-gray-700' : 'text-accent hover:text-accent-dk'}`}>
        {busy ? <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2.5} /> : <Radio className="w-3 h-3" strokeWidth={2.5} />}
        {isLive ? 'End stream' : 'Go live'}
      </button>
    </div>
  )
}

const TABS = ['Posts', 'Schedule', 'Stats']

const SCHEDULE = [
  { day: 'Monday',    time: '8:00 PM', game: 'Valorant Ranked',      duration: '4h', platform: 'twitch' },
  { day: 'Wednesday', time: '7:00 PM', game: 'Just Chatting + Games', duration: '3h', platform: 'twitch' },
  { day: 'Friday',    time: '9:00 PM', game: 'New Release Friday',    duration: '5h', platform: 'kick' },
  { day: 'Saturday',  time: '3:00 PM', game: 'Subscriber Stream',     duration: '6h', platform: 'twitch' },
  { day: 'Sunday',    time: '5:00 PM', game: 'Chill Variety Stream',  duration: '4h', platform: 'youtube' },
]
const PLATFORM_DOT = { twitch: 'bg-purple-500', kick: 'bg-green-500', youtube: 'bg-red-500' }

export default function Profile({ initialProfile, initialPosts = [], viewingOwn }) {
  const router = useRouter()
  const { profile: myProfile, fetchProfile } = useAuthStore()
  const { showToast } = useAppStore()
  const [profile, setProfile] = useState(initialProfile)
  const [posts, setPosts] = useState(initialPosts)
  const [tab, setTab] = useState('Posts')
  const [isFollowing, setIsFollowing] = useState(Boolean(initialProfile?.isFollowing))
  // QA #2: pending ≠ connected. status: null | pending | accepted | declined;
  // direction: outgoing (I asked) | incoming (they asked).
  const [conn, setConn] = useState({
    status: initialProfile?.connectionStatus ?? null,
    direction: initialProfile?.connectionDirection ?? null,
    id: initialProfile?.connectionId ?? null,
  })
  const [connBusy, setConnBusy] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteBusy, setFavoriteBusy] = useState(false)
  const [showConnections, setShowConnections] = useState(false)
  const [connectionsList, setConnectionsList] = useState(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [cropTarget, setCropTarget] = useState(null)
  const bannerInputRef = useRef(null)
  const avatarInputRef = useRef(null)
  // Platform catalog (slug → name + brandColor) so every selected platform
  // renders as a badge, not just the three that used to be hardcoded.
  const [platformCatalog, setPlatformCatalog] = useState([])
  const [showBadgeEditor, setShowBadgeEditor] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)
  useEffect(() => { platformApi.list().then(setPlatformCatalog).catch(() => {}) }, [])

  // Post-upgrade celebration: the Stripe flow redirects here with ?upgraded=true.
  // Show a one-time congrats card, reflect Premium immediately (in case this
  // render loaded before the webhook flipped the flag) and strip the param so a
  // refresh doesn't replay it.
  useEffect(() => {
    if (typeof window === 'undefined' || !viewingOwn) return
    const params = new URLSearchParams(window.location.search)
    if (params.get('upgraded') !== 'true') return
    setShowCongrats(true)
    setProfile((p) => (p ? { ...p, isVerified: true } : p))
    fetchProfile?.()
    params.delete('upgraded')
    const qs = params.toString()
    window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
  }, [viewingOwn, fetchProfile])

  const isOwnProfile = viewingOwn || profile?.id === myProfile?.id
  const me = useAuthStore((s) => s.user)
  const isBrandViewer = me?.role === 'company' || me?.role === 'admin'

  // Only company / admin viewers can favourite a creator (Block F).
  useEffect(() => {
    if (!isBrandViewer || isOwnProfile || !profile?.id) return
    let cancelled = false
    favoritesApi.isFavorited(profile.id)
      .then((r) => { if (!cancelled) setIsFavorited(Boolean(r?.favorited)) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [isBrandViewer, isOwnProfile, profile?.id])

  const toggleFavorite = async () => {
    if (favoriteBusy || !profile?.id) return
    setFavoriteBusy(true)
    try {
      if (isFavorited) {
        await favoritesApi.remove(profile.id); setIsFavorited(false); showToast('Removed from favourites')
      } else {
        await favoritesApi.add(profile.id); setIsFavorited(true); showToast('Saved to favourites')
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error')
    } finally {
      setFavoriteBusy(false)
    }
  }

  // Record a view (idempotent per day) when looking at someone else's profile.
  useEffect(() => {
    if (!isOwnProfile && profile?.id) {
      profileApi.recordView(profile.id).catch(() => {})
    }
  }, [isOwnProfile, profile?.id])

  const handleCroppedUpload = async (blob) => {
    if (!cropTarget) return
    const { kind } = cropTarget
    const setUploading = kind === 'banner' ? setUploadingBanner : setUploadingAvatar
    const field = kind === 'banner' ? 'bannerUrl' : 'avatarUrl'
    setUploading(true)
    try {
      const ext = blob.type === 'image/png' ? 'png' : 'jpg'
      const named = new File([blob], `${kind}-${Date.now()}.${ext}`, { type: blob.type })
      const url = await uploadFile({ file: named, kind })
      const updated = await profileApi.updateMe({ [field]: url })
      setProfile((p) => ({ ...(p ?? {}), ...updated }))
      await fetchProfile()
      showToast(kind === 'banner' ? 'Cover updated' : 'Profile photo updated')
      setCropTarget(null)
    } catch (err) {
      showToast(err.message || 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await followApi.unfollow(profile.id); setIsFollowing(false); showToast('Unfollowed')
      } else {
        await followApi.follow(profile.id); setIsFollowing(true); showToast(`Following ${profile.displayName}`)
      }
    } catch (err) { showToast(err.message || 'Action failed', 'error') }
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

  const connState = conn.status === 'accepted' ? 'connected'
    : conn.status && conn.direction === 'incoming' && conn.status === 'pending' ? 'incoming'
    : conn.status ? 'requested'
    : 'none'

  const handleConnect = async () => {
    if (connBusy || connState === 'connected') return
    setConnBusy(true)
    try {
      if (connState === 'none') {
        const created = await connectionApi.create(profile.id)
        setConn({ status: 'pending', direction: 'outgoing', id: created?.id ?? null })
        showToast('Connection request sent')
      } else if (connState === 'requested') {
        if (!conn.id || !window.confirm('Cancel your connection request?')) return
        await connectionApi.delete(conn.id)
        setConn({ status: null, direction: null, id: null })
        showToast('Request cancelled')
      } else if (connState === 'incoming') {
        await connectionApi.respond(conn.id, 'accepted')
        setConn((c) => ({ ...c, status: 'accepted' }))
        setProfile((p) => ({ ...p, connectionsCount: (p.connectionsCount || 0) + 1 }))
        fetchProfile?.()
        showToast(`You're now connected with ${profile.displayName}`)
      }
    } catch (err) {
      if (err.code === 'CONNECTION_EXISTS') showToast('A request between you already exists', 'error')
      else showToast(err.message || 'Could not update the connection', 'error')
    } finally {
      setConnBusy(false)
    }
  }

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
        <Link href="/profile-views"
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
        <div className="relative h-44 bg-aurora group/banner">
          {profile.bannerUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          {isOwnProfile && (
            <>
              <button type="button" onClick={() => bannerInputRef.current?.click()} disabled={uploadingBanner}
                className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/55 hover:bg-black/75 text-white text-[12px] font-bold rounded-full backdrop-blur-sm transition opacity-0 group-hover/banner:opacity-100 disabled:opacity-100 disabled:cursor-wait">
                {uploadingBanner
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} /> Uploading…</>
                  : <><Camera className="w-3.5 h-3.5" strokeWidth={2.5} /> {profile.bannerUrl ? 'Change cover' : 'Add cover'}</>}
              </button>
              <input ref={bannerInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) setCropTarget({ kind: 'banner', file: f }) }} />
            </>
          )}
        </div>
        <div className="px-6 pb-5">
          <div className="flex items-start justify-between mb-4">
            <div className="relative group/avatar -mt-10">
              <div className="w-20 h-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-graduate-radial flex items-center justify-center text-white font-extrabold text-2xl">
                {profile.avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : initials}
              </div>
              {isOwnProfile && (
                <>
                  <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}
                    aria-label={profile.avatarUrl ? 'Change profile photo' : 'Add profile photo'}
                    className="absolute inset-0 rounded-full bg-black/55 backdrop-blur-[2px] flex items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition disabled:opacity-100 disabled:cursor-wait">
                    {uploadingAvatar
                      ? <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2.5} />
                      : <Camera className="w-5 h-5" strokeWidth={2.25} />}
                  </button>
                  <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) setCropTarget({ kind: 'avatar', file: f }) }} />
                </>
              )}
              {profile.isLive && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-live text-white text-[9.5px] font-black px-2 py-0.5 rounded-full border-2 border-white">LIVE</div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-3">
              {isOwnProfile ? (
                <button onClick={() => router.push('/settings')} aria-label="Edit profile"
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 border border-gray-200 rounded-full text-[12.5px] font-bold text-gray-600 hover:border-gray-400 hover:text-gray-900 transition">
                  <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} /> Edit profile
                </button>
              ) : (
                <>
                  {isBrandViewer && (
                    <button onClick={toggleFavorite} disabled={favoriteBusy}
                      aria-label={isFavorited ? 'Remove from favourites' : 'Save to favourites'}
                      title={isFavorited ? 'Saved to favourites' : 'Save to favourites'}
                      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition disabled:opacity-50
                        ${isFavorited ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100' : 'border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800'}`}>
                      {favoriteBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} />
                        : <Bookmark className="w-3.5 h-3.5" strokeWidth={2.5} fill={isFavorited ? 'currentColor' : 'none'} />}
                    </button>
                  )}
                  <button onClick={handleFollow}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition ${isFollowing ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'border border-accent text-accent hover:bg-accent hover:text-white'}`}>
                    {isFollowing
                      ? <><Check className="w-3.5 h-3.5" strokeWidth={3} /> Following</>
                      : <><Plus className="w-3.5 h-3.5" strokeWidth={3} /> Follow</>}
                  </button>
                  <button onClick={handleConnect} disabled={connBusy || connState === 'connected'}
                    title={connState === 'requested' ? 'Pending — click to cancel the request' : undefined}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition disabled:cursor-default ${
                      connState === 'connected' ? 'bg-gray-100 text-gray-500'
                      : connState === 'requested' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'btn-gradient text-white hover:bg-accent-dk'}`}>
                    {connBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} />
                      : connState === 'connected' ? <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      : connState === 'requested' ? <Clock className="w-3.5 h-3.5" strokeWidth={2.5} />
                      : <Handshake className="w-3.5 h-3.5" strokeWidth={2.5} />}
                    {connState === 'connected' ? 'Connected' : connState === 'requested' ? 'Requested' : connState === 'incoming' ? 'Accept' : 'Connect'}
                  </button>
                </>
              )}
            </div>
          </div>

          {isOwnProfile && <StreamStatusPill profile={profile} setProfile={setProfile} />}

          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[20px] font-extrabold">{profile.displayName}</h1>
            {profile.isVerified && <PremiumBadge size={18} />}
            <RoleBadge role={profile.role} size="sm" />
          </div>
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

          {profile.platforms?.length > 0 && (() => {
            const all = profile.platforms ?? []
            const featured = (profile.featuredPlatforms ?? []).filter((s) => all.includes(s))
            // Show up to 3 badges: the chosen featured ones, else alphabetically.
            const badgeSlugs = (featured.length ? featured : [...all].sort()).slice(0, 3)
            const linkFor = (slug) => profile.platformLinks?.[slug]
              || (slug.includes('twitch') ? profile.twitchUrl : slug.includes('kick') ? profile.kickUrl : slug.includes('youtube') ? profile.youtubeUrl : null)
            return (
              <div className="flex gap-2 mb-3 flex-wrap items-center">
                {badgeSlugs.map((slug) => {
                  const p = platformCatalog.find((x) => x.slug === slug)
                  const label = p?.name || slug.replace(/-/g, ' ')
                  const color = p?.brandColor || '#6B7280'
                  const url = linkFor(slug)
                  const cls = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold capitalize transition hover:brightness-95'
                  const style = { color, backgroundColor: `${color}14` }
                  return url
                    ? <a key={slug} href={url} target="_blank" rel="noopener noreferrer" className={cls} style={style}>{label}</a>
                    : <span key={slug} className={cls} style={style}>{label}</span>
                })}
                {isOwnProfile && all.length > 0 && (
                  <button onClick={() => setShowBadgeEditor(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11.5px] font-bold text-gray-500 border border-dashed border-gray-300 hover:border-gray-500 hover:text-gray-700 transition">
                    <Pencil className="w-3 h-3" strokeWidth={2.5} /> Edit badges
                  </button>
                )}
              </div>
            )
          })()}

          {showBadgeEditor && (
            <BadgeEditor
              platforms={profile.platforms ?? []}
              featured={profile.featuredPlatforms ?? []}
              catalog={platformCatalog}
              onClose={() => setShowBadgeEditor(false)}
              onSave={async (slugs) => {
                try {
                  const updated = await profileApi.updateMe({ featuredPlatforms: slugs })
                  setProfile((p) => ({ ...(p ?? {}), ...updated }))
                  setShowBadgeEditor(false)
                  showToast('Badges updated')
                } catch (e) { showToast(e.message || 'Could not update badges', 'error') }
              }}
            />
          )}

          <div className="flex border-t border-gray-100 -mx-6 mt-3">
            {statCards.map((s) => {
              const isClickable = s.label === 'Connections' && (profile.connectionsCount ?? 0) > 0
              const content = (
                <>
                  <div className="text-[17px] font-extrabold">{s.value}</div>
                  <div className="text-[10.5px] text-gray-400 font-semibold">{s.label}</div>
                </>
              )
              const base = 'flex-1 text-center py-3 border-r border-gray-100 last:border-0 transition'
              return isClickable
                ? <button key={s.label} onClick={() => { setShowConnections(true); openConnectionsModal() }}
                    className={`${base} cursor-pointer hover:bg-accent-lt/60 focus:outline-none`}>{content}</button>
                : <div key={s.label} className={`${base} cursor-default`}>{content}</div>
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100 px-5">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`relative px-5 py-3.5 text-[13px] font-bold transition ${tab === t ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
              {t}
              {tab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded" />}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 'Posts' && (
            <div className="space-y-3">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" strokeWidth={1.75} />
                  <div className="font-bold text-gray-600">{isOwnProfile ? "You haven't posted yet" : 'No posts yet'}</div>
                </div>
              ) : posts.map((post) => (
                // QA #3/#6: full post cards (comments, repost, share, ⋯ delete) like the feed
                <PostCard key={post.id} post={post} onDeleted={(id) => setPosts((list) => list.filter((p) => p.id !== id))} />
              ))}
            </div>
          )}

          {tab === 'Schedule' && (
            <div className="space-y-2">
              <h3 className="font-extrabold text-[15px] mb-3">Stream Schedule</h3>
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

          {tab === 'Stats' && (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Avg Viewers',    value: '3,240',  Icon: Eye,    color: 'text-accent',    bg: 'bg-accent-lt' },
                  { label: 'Peak Viewers',   value: '12,890', Icon: Rocket, color: 'text-green-600', bg: 'bg-green-50' },
                  { label: 'Hours Streamed', value: '487h',   Icon: Clock,  color: 'text-blue-500',  bg: 'bg-blue-50' },
                  { label: 'Total Followers', value: profile.followersCount > 0 ? profile.followersCount.toLocaleString() : '—',
                    Icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
                ].map((s) => (
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

      {/* Crop modal */}
      {cropTarget && (
        <ImageCropModal file={cropTarget.file}
          aspect={CROP_SPEC[cropTarget.kind].aspect}
          outputSize={CROP_SPEC[cropTarget.kind].outputSize}
          title={CROP_SPEC[cropTarget.kind].title}
          onCancel={() => setCropTarget(null)}
          onConfirm={handleCroppedUpload} />
      )}

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
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-accent animate-spin" strokeWidth={2.5} /></div>
              ) : connectionsList.length === 0 ? (
                <div className="text-center py-10 text-sm text-gray-400">No connections yet.</div>
              ) : connectionsList.map(({ connectionId, profile: p }) => (
                <Link key={connectionId} href={`/profile/${p.id}`} onClick={() => setShowConnections(false)}
                  className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition">
                  <div className="w-10 h-10 rounded-full bg-graduate-radial text-white font-bold text-xs flex items-center justify-center overflow-hidden flex-shrink-0">
                    {p.avatarUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : (p.displayName || '??').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13.5px] font-extrabold truncate">{p.displayName}</span>
                      {p.isVerified && <PremiumBadge size={13} />}
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

      {/* Post-upgrade congratulations */}
      {showCongrats && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCongrats(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-center" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-8 pb-10 text-white" style={{ background: 'linear-gradient(135deg, #F6A621 0%, #FB523C 100%)' }}>
              <div className="text-4xl mb-2">🎉</div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-[12px] font-extrabold mb-3">
                <PremiumBadge size={14} /> Premium
              </div>
              <h2 className="text-[22px] font-extrabold leading-tight">You&apos;re Premium!</h2>
            </div>
            <div className="px-6 py-6">
              <p className="text-[13.5px] text-gray-600 leading-relaxed mb-5">
                Welcome to Streamer Premium. Your badge is live on your profile, and every
                Premium perk is now unlocked. Thanks for the support! 🧡
              </p>
              <button onClick={() => setShowCongrats(false)}
                className="w-full h-11 btn-gradient text-white font-bold rounded-full text-sm transition">
                View my profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Pick up to 3 platforms to feature as badges on the profile (alphabetical).
function BadgeEditor({ platforms, featured, catalog, onClose, onSave }) {
  const [selected, setSelected] = useState(() => featured.filter((s) => platforms.includes(s)).slice(0, 3))
  const [saving, setSaving] = useState(false)
  const sorted = [...platforms].sort((a, b) => a.localeCompare(b))
  const meta = (slug) => catalog.find((x) => x.slug === slug)
  const nameFor = (slug) => meta(slug)?.name || slug.replace(/-/g, ' ')
  const colorFor = (slug) => meta(slug)?.brandColor || '#6B7280'

  const toggle = (slug) =>
    setSelected((sel) =>
      sel.includes(slug) ? sel.filter((s) => s !== slug) : sel.length >= 3 ? sel : [...sel, slug]
    )

  const save = async () => { setSaving(true); await onSave(selected); setSaving(false) }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between p-5 pb-3 flex-none">
          <div>
            <h2 className="text-[16px] font-extrabold">Profile badges</h2>
            <p className="text-[12.5px] text-gray-400 mt-0.5">Pick up to 3 platforms to show on your profile.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-5 pb-3 overflow-y-auto flex-1 min-h-0">
          <div className="flex flex-wrap gap-2">
            {sorted.map((slug) => {
              const on = selected.includes(slug)
              const color = colorFor(slug)
              return (
                <button key={slug} type="button" onClick={() => toggle(slug)}
                  disabled={!on && selected.length >= 3}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12.5px] font-bold capitalize transition disabled:opacity-40 hover:brightness-95"
                  style={{ color, backgroundColor: on ? `${color}26` : `${color}14`, border: `1.5px solid ${on ? color : 'transparent'}` }}>
                  {on && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
                  {nameFor(slug)}
                </button>
              )
            })}
          </div>
        </div>
        <div className="p-5 pt-3 border-t border-gray-100 flex items-center justify-between flex-none">
          <span className="text-[12px] text-gray-400 font-semibold">{selected.length}/3 selected</span>
          <button onClick={save} disabled={saving}
            className="btn-gradient text-white h-10 px-5 rounded-full text-[13px] font-bold inline-flex items-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} /> : null} Save
          </button>
        </div>
      </div>
    </div>
  )
}
