'use client'
import { useEffect, useState } from 'react'
import { BarChart3, EyeOff, Loader2, ShieldCheck, Trash2, Users as UsersIcon } from 'lucide-react'
import { adminApi } from '@/lib/api-client'
import { useAppStore, useAuthStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'

const TABS = [
  { id: 'overview',   label: 'Overview',   Icon: BarChart3 },
  { id: 'users',      label: 'Users',      Icon: UsersIcon },
  { id: 'moderation', label: 'Moderation', Icon: ShieldCheck },
]

export default function AdminPage() {
  const { user } = useAuthStore()
  const { showToast } = useAppStore()
  const [tab, setTab] = useState('overview')

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-16 text-center">
        <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
        <div className="text-[16px] font-extrabold">Admins only</div>
        <div className="text-sm text-gray-400 mt-1">You do not have permission to view this page.</div>
      </div>
    )
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="w-5 h-5 text-accent" strokeWidth={2.5} />
        <h1 className="text-[22px] font-extrabold tracking-tight">Admin</h1>
      </div>

      <div className="flex items-center gap-px border-b border-gray-200 mb-4">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold transition
              ${tab === id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}>
            <Icon className="w-4 h-4" strokeWidth={2.25} />
            {label}
            {tab === id && <span className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-gray-900 rounded" />}
          </button>
        ))}
      </div>

      {tab === 'overview'   && <OverviewTab showToast={showToast} />}
      {tab === 'users'      && <UsersTab showToast={showToast} />}
      {tab === 'moderation' && <ModerationTab showToast={showToast} />}
    </div>
  )
}

function OverviewTab({ showToast }) {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .catch((e) => showToast(e.message || 'Failed to load stats', 'error'))
  }, [])
  if (!stats) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-accent animate-spin" /></div>

  const cards = [
    { label: 'Total users',      value: stats.users.total,            sub: `+${stats.users.newLast7d} this week` },
    { label: 'Active users',     value: stats.users.active,           sub: 'not suspended' },
    { label: 'Posts',            value: stats.posts.total,            sub: `+${stats.posts.newLast7d} this week` },
    { label: 'Messages',         value: stats.messages.total,         sub: 'total sent' },
    { label: 'Companies',        value: stats.companies.total,        sub: 'brand pages' },
    { label: 'Active subs',      value: stats.subscriptions.active,   sub: 'paid plan' },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="text-[11px] font-extrabold text-gray-400 uppercase tracking-wider">{c.label}</div>
          <div className="text-[26px] font-extrabold tracking-tight mt-1">{Number(c.value).toLocaleString()}</div>
          <div className="text-[11.5px] text-gray-400 mt-1">{c.sub}</div>
        </div>
      ))}
    </div>
  )
}

function UsersTab({ showToast }) {
  const [data, setData] = useState({ items: [] })
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    adminApi.users({ q: q || undefined, role: roleFilter || undefined, limit: 50 })
      .then(setData)
      .catch((e) => showToast(e.message || 'Failed', 'error'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const toggleSuspend = async (u) => {
    try {
      await adminApi.suspend(u.id, !u.suspendedAt)
      showToast(u.suspendedAt ? 'Unsuspended' : 'Suspended')
      load()
    } catch (e) { showToast(e.message || 'Failed', 'error') }
  }

  const setRole = async (u, role) => {
    try {
      await adminApi.setRole(u.id, role)
      showToast('Role updated')
      load()
    } catch (e) { showToast(e.message || 'Failed', 'error') }
  }

  const deleteU = async (u) => {
    if (!window.confirm(`Delete user ${u.email}? This cannot be undone.`)) return
    try {
      await adminApi.deleteUser(u.id)
      showToast('User deleted')
      load()
    } catch (e) { showToast(e.message || 'Failed', 'error') }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <input
          value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          placeholder="Search by email, handle, name…"
          className="flex-1 min-w-[200px] h-9 px-3 bg-white border border-gray-200 rounded-full text-[13px] outline-none focus:border-accent"
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 px-3 bg-white border border-gray-200 rounded-full text-[12.5px] outline-none focus:border-accent">
          <option value="">All roles</option>
          <option value="streamer">Streamer</option>
          <option value="company">Company</option>
          <option value="admin">Admin</option>
        </select>
        <button onClick={load} className="h-9 px-4 bg-gray-900 text-white font-bold text-[12px] rounded-full">Search</button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-accent animate-spin" /></div>
        ) : data.items.length === 0 ? (
          <div className="text-center py-10 text-sm text-gray-400">No users match.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-[12.5px]">
              <thead>
                <tr className="text-[10.5px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left px-4 py-2.5">User</th>
                  <th className="text-left px-4 py-2.5">Email</th>
                  <th className="text-left px-4 py-2.5">Role</th>
                  <th className="text-left px-4 py-2.5">Status</th>
                  <th className="text-left px-4 py-2.5">Joined</th>
                  <th className="text-right px-4 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent to-purple-400 text-white font-bold text-[10px] flex items-center justify-center overflow-hidden">
                          {u.profile?.avatarUrl
                            ? <img src={u.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : (u.profile?.displayName || '??').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold truncate">{u.profile?.displayName || '—'}</div>
                          <div className="text-[10.5px] text-gray-400 truncate">@{u.profile?.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600 truncate max-w-[220px]">{u.email}</td>
                    <td className="px-4 py-2.5">
                      <select value={u.role} onChange={(e) => setRole(u, e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5 text-[11px] font-bold outline-none focus:border-accent">
                        <option value="streamer">Streamer</option>
                        <option value="company">Company</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-2.5">
                      {u.suspendedAt
                        ? <span className="text-[10.5px] font-extrabold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Suspended</span>
                        : <span className="text-[10.5px] font-extrabold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>}
                    </td>
                    <td className="px-4 py-2.5 text-gray-400">{formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}</td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="inline-flex gap-1.5">
                        <button onClick={() => toggleSuspend(u)}
                          className={`px-2.5 py-1 text-[10.5px] font-bold rounded-full border transition
                            ${u.suspendedAt ? 'border-green-400 text-green-700 hover:bg-green-50' : 'border-amber-400 text-amber-700 hover:bg-amber-50'}`}>
                          {u.suspendedAt ? 'Unsuspend' : 'Suspend'}
                        </button>
                        <button onClick={() => deleteU(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[10.5px] font-bold text-red-600 border border-red-200 hover:bg-red-50 rounded-full transition">
                          <Trash2 className="w-3 h-3" strokeWidth={2.25} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function ModerationTab({ showToast }) {
  const [flagged, setFlagged] = useState(null)
  const load = () => adminApi.flaggedReviews().then(setFlagged).catch((e) => showToast(e.message || 'Failed', 'error'))
  useEffect(() => { load() }, [])

  const unhide = async (kind, id) => {
    try {
      const fn = kind === 'platform' ? adminApi.hidePlatformReview : adminApi.hideCompanyReview
      await fn(id, false)
      showToast('Restored')
      load()
    } catch (e) { showToast(e.message || 'Failed', 'error') }
  }

  if (!flagged) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-accent animate-spin" /></div>

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="text-[13px] font-extrabold">Hidden reviews</div>
        <div className="text-[11px] text-gray-400">Click Restore to bring a review back</div>
      </div>
      {flagged.length === 0 ? (
        <div className="text-center py-10 text-sm text-gray-400">
          <EyeOff className="w-5 h-5 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
          No hidden reviews right now.
        </div>
      ) : flagged.map((r) => (
        <div key={`${r.kind}-${r.id}`} className="px-5 py-4 border-b border-gray-50 last:border-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10.5px] font-extrabold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{r.kind.toUpperCase()}</span>
                <span className="text-[11.5px] font-bold text-amber-500">★ {r.rating}</span>
                <span className="text-[11px] text-gray-400">· {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
              </div>
              {r.content && <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{r.content}</p>}
            </div>
            <button onClick={() => unhide(r.kind, r.id)}
              className="flex-shrink-0 px-3 py-1 text-[11px] font-bold text-accent border border-accent rounded-full hover:bg-accent hover:text-white transition">
              Restore
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
