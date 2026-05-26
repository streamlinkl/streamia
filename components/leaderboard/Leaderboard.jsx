'use client'
import { useEffect, useMemo, useState } from 'react'
import { Link } from '@/lib/router-shim'
import { BadgeCheck, Crown, Medal, Trophy } from 'lucide-react'
import { leaderboardApi, platformApi } from '@/lib/api-client'
import { useAppStore } from '@/lib/store'

function formatPeriodLabel(period, periodStart) {
  if (!periodStart) return ''
  const d = new Date(periodStart)
  if (period === 'weekly') {
    const end = new Date(d.getTime() + 6 * 24 * 60 * 60 * 1000)
    const fmt = (x) => x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return `Week of ${fmt(d)} – ${fmt(end)}`
  }
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function rankBadge(rank) {
  const base = 'w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm'
  if (rank === 1) return <div className={`${base} bg-yellow-400 text-yellow-900`}><Crown className="w-4 h-4" strokeWidth={2.5} /></div>
  if (rank === 2) return <div className={`${base} bg-gray-300 text-gray-800`}><Medal className="w-4 h-4" strokeWidth={2.5} /></div>
  if (rank === 3) return <div className={`${base} bg-amber-500/80 text-white`}><Medal className="w-4 h-4" strokeWidth={2.5} /></div>
  return <div className={`${base} bg-gray-100 text-gray-500`}>#{rank}</div>
}

export default function LeaderboardPage() {
  const { showToast } = useAppStore()
  const [period, setPeriod] = useState('weekly')
  const [platformFilter, setPlatformFilter] = useState('') // '' = any, 'overall' = null platform
  const [data, setData] = useState(null)
  const [platforms, setPlatforms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    platformApi.list().then(setPlatforms).catch(() => setPlatforms([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const opts = { period }
    if (platformFilter === 'overall') opts.overall = true
    else if (platformFilter) opts.platform = platformFilter
    leaderboardApi.list(opts)
      .then((d) => { if (!cancelled) setData(d) })
      .catch((err) => { if (!cancelled) { showToast(err.message || 'Failed to load', 'error'); setData({ items: [] }) } })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [period, platformFilter])

  const topPlatforms = useMemo(() => platforms.filter((p) => p.category === 'major').slice(0, 6), [platforms])

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5 space-y-4">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="inline-flex items-center gap-2 text-[22px] font-extrabold tracking-tight">
            <Trophy className="w-5 h-5 text-amber-500" strokeWidth={2.5} />
            Leaderboard
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{formatPeriodLabel(period, data?.periodStart)}</p>
        </div>
        <div className="flex items-center gap-2">
          {['weekly', 'monthly'].map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-[12.5px] font-bold transition
                ${period === p ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'}`}>
              {p === 'weekly' ? 'Weekly' : 'Monthly'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Platform:</span>
        <button
          onClick={() => setPlatformFilter('')}
          className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition ${platformFilter === '' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
          All
        </button>
        <button
          onClick={() => setPlatformFilter('overall')}
          className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition ${platformFilter === 'overall' ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
          Overall
        </button>
        {topPlatforms.map((p) => (
          <button key={p.slug} onClick={() => setPlatformFilter(p.slug)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition ${platformFilter === p.slug ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
            <span className="inline-block w-2 h-2 rounded-full mr-1.5 align-middle" style={{ backgroundColor: p.brandColor || '#9CA3AF' }} />
            {p.name}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-14"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>
        ) : data?.items?.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5 text-gray-400" strokeWidth={2} />
            </div>
            <div className="font-bold text-gray-600">No rankings yet</div>
            <div className="text-sm text-gray-400 mt-1">Check back soon — admins publish rankings each period.</div>
          </div>
        ) : (
          <div>
            {data.items.map((entry, i) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 px-5 py-4 ${i !== data.items.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition`}>
                {rankBadge(entry.rank)}
                <Link to={`/profile/${entry.profile.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 overflow-hidden">
                    {entry.profile.avatarUrl
                      ? <img src={entry.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : (entry.profile.displayName || '??').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-extrabold truncate">{entry.profile.displayName}</span>
                      {entry.profile.isVerified && <BadgeCheck className="w-4 h-4 text-sky-500 flex-shrink-0" fill="currentColor" strokeWidth={0} />}
                      {entry.profile.isLive && <span className="text-[9.5px] bg-live text-white font-black px-1.5 py-0.5 rounded-full">LIVE</span>}
                    </div>
                    <div className="text-[11.5px] text-gray-400 truncate">@{entry.profile.handle}{entry.profile.category ? ` · ${entry.profile.category}` : ''}</div>
                  </div>
                </Link>
                {entry.platform && (
                  <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                    style={{ color: entry.platform.brandColor || '#6B7280', backgroundColor: `${entry.platform.brandColor || '#9CA3AF'}14` }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.platform.brandColor || '#9CA3AF' }} />
                    {entry.platform.name}
                  </div>
                )}
                {typeof entry.score === 'number' && (
                  <div className="text-right flex-shrink-0">
                    <div className="text-[15px] font-extrabold text-accent">{entry.score.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-400 font-semibold">score</div>
                  </div>
                )}
                {entry.note && (
                  <div className="hidden lg:block max-w-[200px] text-[11.5px] text-gray-500 truncate" title={entry.note}>{entry.note}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
