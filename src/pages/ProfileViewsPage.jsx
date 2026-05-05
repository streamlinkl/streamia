import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Crown, Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { profileViewApi, stripeApi } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

export default function ProfileViewsPage() {
  const { showToast } = useAppStore()
  const [summary, setSummary] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([profileViewApi.summary(), profileViewApi.list(50)])
      .then(([s, list]) => {
        if (cancelled) return
        setSummary(s)
        setData(list)
      })
      .catch((err) => { if (!cancelled) showToast(err.message || 'Could not load views', 'error') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const startUpgrade = async () => {
    setUpgrading(true)
    try {
      const { url } = await stripeApi.checkout({ plan: 'pro', billing: 'monthly' })
      if (url) window.location.href = url
      else showToast('Checkout temporarily unavailable. Please try again later.', 'error')
    } catch (err) {
      showToast(err.message || 'Could not start checkout', 'error')
    } finally {
      setUpgrading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-accent animate-spin" strokeWidth={2.5} />
      </div>
    )
  }

  const locked = data?.locked
  const items = data?.items ?? []

  return (
    <div className="max-w-[800px] mx-auto px-4 py-5 space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent-lt rounded-full flex items-center justify-center">
            <Eye className="w-5 h-5 text-accent" strokeWidth={2.25} />
          </div>
          <div>
            <h1 className="text-[18px] font-extrabold">Who viewed your profile</h1>
            <p className="text-[12.5px] text-gray-500">See who's been checking you out — last 90 days.</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: 'Last 7 days',  value: summary?.last7  ?? 0 },
            { label: 'Last 30 days', value: summary?.last30 ?? 0 },
            { label: 'All time',     value: summary?.total  ?? 0 },
          ].map((s) => (
            <div key={s.label} className="border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-[20px] font-extrabold text-accent">{s.value.toLocaleString()}</div>
              <div className="text-[11px] text-gray-400 font-semibold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {locked ? (
        <div className="bg-gradient-to-br from-accent-lt via-white to-amber-50 border border-amber-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="w-12 h-12 mx-auto bg-white border border-amber-200 rounded-full flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-amber-600" strokeWidth={2.25} />
          </div>
          <h2 className="text-[16px] font-extrabold mb-1">Unlock who viewed your profile</h2>
          <p className="text-[13px] text-gray-600 max-w-md mx-auto mb-4">
            Free accounts see how many people viewed you. Upgrade to <b>Pro</b> for $15/month to see <b>who</b> they
            are, plus unlimited messaging.
          </p>
          <button
            onClick={startUpgrade}
            disabled={upgrading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-[13px] font-bold rounded-full transition disabled:opacity-50">
            {upgrading
              ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} />
              : <Crown className="w-4 h-4" strokeWidth={2.25} />}
            Upgrade to Pro · $15/mo
          </button>
          <Link to="/pricing" className="block mt-2 text-[12px] font-semibold text-accent hover:underline">See all plans</Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-[14px] font-extrabold">Recent viewers</h2>
            <span className="text-[11.5px] text-gray-400">{items.length} shown</span>
          </div>
          {items.length === 0 ? (
            <div className="text-center py-12 text-[13px] text-gray-400">
              <Eye className="w-6 h-6 text-gray-300 mx-auto mb-2" strokeWidth={1.75} />
              No views yet — share your profile to get noticed.
            </div>
          ) : (
            items.map((row) => (
              <div key={row.id} className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
                {row.viewer ? (
                  <Link to={`/profile/${row.viewer.id}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-80 transition">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-400 text-white font-bold text-xs flex items-center justify-center overflow-hidden flex-shrink-0">
                      {row.viewer.avatarUrl
                        ? <img src={row.viewer.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : (row.viewer.displayName || '??').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13.5px] font-extrabold truncate">{row.viewer.displayName}</span>
                        {row.viewer.isVerified && <BadgeCheck className="w-4 h-4 text-sky-500 flex-shrink-0" fill="currentColor" strokeWidth={0} />}
                      </div>
                      <div className="text-[11.5px] text-gray-400 truncate">@{row.viewer.handle}{row.viewer.category ? ` · ${row.viewer.category}` : ''}</div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0">
                      <EyeOff className="w-5 h-5" strokeWidth={2.25} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-extrabold text-gray-500">Anonymous viewer</div>
                      <div className="text-[11.5px] text-gray-400">Hidden their identity</div>
                    </div>
                  </div>
                )}
                <span className="text-[11px] text-gray-400 flex-shrink-0">
                  {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
