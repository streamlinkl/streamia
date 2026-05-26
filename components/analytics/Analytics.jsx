'use client'
import { SkeletonStat } from '@/components/Skeleton'
import { useEffect, useState } from 'react'
import { analyticsApi } from '@/lib/api-client'
import { useAuthStore } from '@/lib/store'

const BAR_HEIGHTS = [40, 65, 55, 80, 70, 95, 75, 88, 60, 72, 85, 100]
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const WEEK_DATA = [30, 55, 45, 70, 85, 100, 60]

export default function AnalyticsPage() {
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({ posts: 0, connections: 0, messages: 0, followers: 0 })
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('Month')

  useEffect(() => {
    if (!profile) return
    let cancelled = false
    const run = async () => {
      try {
        const data = await analyticsApi.me()
        if (!cancelled) setStats(data)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [profile])

  const kpis = [
    { label: 'Profile Views', value: '2,847', change: '+18%', up: true, icon: '👁️' },
    { label: 'Connections', value: stats.connections, change: '+5', up: true, icon: '🤝' },
    { label: 'Posts', value: stats.posts, change: `${stats.posts} total`, up: true, icon: '📝' },
    { label: 'Followers', value: stats.followers, change: '+12%', up: true, icon: '👥' },
  ]

  const platforms = [
    { name: 'Twitch', icon: '🟣', pct: 58, color: 'bg-purple-500', viewers: '4.2K avg', growth: '+8%' },
    { name: 'Kick', icon: '🟢', pct: 28, color: 'bg-green-500', viewers: '2.1K avg', growth: '+24%' },
    { name: 'YouTube', icon: '🔴', pct: 14, color: 'bg-red-500', viewers: '980 avg', growth: '+5%' },
  ]

  const topStreams = [
    { title: 'Valorant Ranked Grind', date: 'Mar 8', viewers: '6,240', hours: '5h 20m', earnings: '$420' },
    { title: 'Subscriber Stream w/ IRL guests', date: 'Mar 3', viewers: '5,890', hours: '4h 15m', earnings: '$380' },
    { title: 'New Game First Look', date: 'Feb 28', viewers: '4,710', hours: '3h 40m', earnings: '$290' },
    { title: 'Charity Marathon Day 1', date: 'Feb 22', viewers: '8,100', hours: '8h 00m', earnings: '$1,200' },
  ]

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-extrabold">Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your StreamLink activity and growth</p>
        </div>
        <div className="flex gap-2">
          {['Week','Month','Year'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-[12.5px] font-bold transition ${period === p ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{k.label}</span>
              <span className="text-lg">{k.icon}</span>
            </div>
            <div className="text-[26px] font-extrabold tracking-tight">{loading ? '—' : k.value}</div>
            <div className={`text-[11.5px] font-semibold mt-1 ${k.up ? 'text-green-600' : 'text-red-500'}`}>
              {k.up ? '↑' : '↓'} {k.change} this {period.toLowerCase()}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-4">
        {/* Profile views chart */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[14px] font-extrabold">Profile Views</div>
              <div className="text-[12px] text-gray-400">Last 12 months</div>
            </div>
            <div className="text-[22px] font-extrabold text-accent">2,847 <span className="text-[13px] text-green-500 font-semibold">↑ 18%</span></div>
          </div>
          <div className="flex items-end gap-2 h-36">
            {BAR_HEIGHTS.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-sm bg-accent/20 hover:bg-accent transition cursor-pointer relative group"
                  style={{ height: `${h}%` }}>
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                    {Math.round(h * 28)} views
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {MONTHS.map(m => <span key={m} className="text-[9px] text-gray-400 flex-1 text-center">{m}</span>)}
          </div>
        </div>

        {/* Platform breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <div className="text-[14px] font-extrabold mb-1">Platform Breakdown</div>
          <div className="text-[12px] text-gray-400 mb-4">Avg concurrent viewers</div>
          <div className="space-y-4">
            {platforms.map(p => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span>{p.icon}</span>
                    <span className="text-[13px] font-semibold">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[12px] font-bold">{p.viewers}</span>
                    <span className="text-[11px] text-green-600 font-semibold ml-1">{p.growth}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${p.color} transition-all`} style={{ width: `${p.pct}%` }} />
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">{p.pct}% of total viewership</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly activity */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <div className="text-[14px] font-extrabold mb-4">This Week's Activity</div>
        <div className="flex items-end gap-3 h-24 mb-2">
          {WEEK_DATA.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`w-full rounded-t-md transition cursor-pointer ${h === 100 ? 'bg-accent' : 'bg-accent/25 hover:bg-accent/50'}`}
                style={{ height: `${h}%` }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between">
          {WEEK_DAYS.map(d => <span key={d} className="text-[10.5px] text-gray-400 flex-1 text-center font-medium">{d}</span>)}
        </div>
      </div>

      {/* Top streams */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="text-[14px] font-extrabold">Top Streams</div>
          <div className="text-[12px] text-gray-400">Your best performing recent sessions</div>
        </div>
        <div className="overflow-x-auto"><table className="w-full min-w-[500px]">
          <thead>
            <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
              <th className="text-left px-5 py-2.5">Stream</th>
              <th className="text-right px-5 py-2.5">Peak Viewers</th>
              <th className="text-right px-5 py-2.5">Duration</th>
              <th className="text-right px-5 py-2.5">Est. Earnings</th>
            </tr>
          </thead>
          <tbody>
            {topStreams.map((s, i) => (
              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition">
                <td className="px-5 py-3">
                  <div className="text-[13px] font-semibold">{s.title}</div>
                  <div className="text-[11px] text-gray-400">{s.date}</div>
                </td>
                <td className="px-5 py-3 text-right text-[13px] font-bold">{s.viewers}</td>
                <td className="px-5 py-3 text-right text-[12.5px] text-gray-500">{s.hours}</td>
                <td className="px-5 py-3 text-right text-[13px] font-bold text-green-600">{s.earnings}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </div>
  )
}
