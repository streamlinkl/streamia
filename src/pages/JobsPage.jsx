import { useState } from 'react'
import useSWR from 'swr'
import { Link } from 'react-router-dom'
import { BadgeDollarSign, Briefcase, Building2, Check, MonitorPlay, X } from 'lucide-react'
import { jobApi } from '@/lib/api'
import { useAppStore, useAuthStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import { SkeletonJob } from '@/components/ui/Skeleton'

export const JOB_CATEGORIES = [
  'Influencer Campaigns',
  'Affiliate Marketing',
  'Live Streaming',
  'Adult Content Operations',
  'Coin Reseller (Live Apps)',
]
const CATEGORY_FILTERS = ['All', ...JOB_CATEGORIES]
const PLATFORMS = ['All', 'Twitch', 'Kick', 'YouTube', 'Multi-Platform']

const categoryColors = {
  'Influencer Campaigns':       'bg-violet-50 text-violet-700',
  'Affiliate Marketing':        'bg-emerald-50 text-emerald-700',
  'Live Streaming':             'bg-rose-50 text-rose-700',
  'Adult Content Operations':   'bg-amber-50 text-amber-700',
  'Coin Reseller (Live Apps)':  'bg-cyan-50 text-cyan-700',
}

const payDisplay = (job) => {
  if (!job.payMin) return 'Negotiable'
  const fmt = n => n >= 1000 ? `$${(n/1000).toFixed(0)}K` : `$${n}`
  return `${fmt(job.payMin)}–${fmt(job.payMax)} / ${job.payPeriod}`
}

export default function JobsPage() {
  const { showToast } = useAppStore()
  const { user } = useAuthStore()
  const isCompany = user?.role === 'company' || user?.role === 'admin'
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [platformFilter, setPlatformFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [showApply, setShowApply] = useState(false)
  const [applyMsg, setApplyMsg] = useState('')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(new Set())

  // SWR — cached, instant on re-visit
  const { data: dbJobs, isLoading } = useSWR('jobs', async () => {
    const result = await jobApi.list({ isActive: true, limit: 50 })
    return result.items || []
  })

  const jobs = dbJobs || []
  const filtered = jobs.filter(j => {
    const catMatch = categoryFilter === 'All' || j.category === categoryFilter
    const platMatch = platformFilter === 'All' || j.platform === platformFilter
    return catMatch && platMatch
  })

  // Auto-select first job
  const displaySelected = selected || (filtered.length > 0 ? filtered[0] : null)

  const handleApply = async () => {
    if (!applyMsg.trim()) return
    setApplying(true)
    try {
      await jobApi.apply(displaySelected.id, { message: applyMsg })
      setApplied(s => new Set([...s, displaySelected.id]))
      showToast('Application sent')
      setShowApply(false); setApplyMsg('')
    } catch (err) {
      if (err.code === 'ALREADY_APPLIED') {
        setApplied(s => new Set([...s, displaySelected.id]))
        showToast('You already applied', 'error')
      } else showToast(err.message || 'Could not apply', 'error')
    }
    setApplying(false)
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      {isCompany && (
        <div className="mb-3 flex justify-end">
          <Link to="/jobs/manage"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white text-[12.5px] font-bold rounded-full transition">
            <Briefcase className="w-3.5 h-3.5" strokeWidth={2.5} />
            Manage my jobs
          </Link>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 mb-4 space-y-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <Briefcase className="w-3 h-3" strokeWidth={2.5} /> Category
          </span>
          {CATEGORY_FILTERS.map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition ${categoryFilter === c ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            <MonitorPlay className="w-3 h-3" strokeWidth={2.5} /> Platform
          </span>
          {PLATFORMS.map(p => (
            <button key={p} onClick={() => setPlatformFilter(p)}
              className={`px-3 py-1.5 rounded-full text-[12px] font-bold transition ${platformFilter === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[340px_1fr] gap-4">
        {/* Jobs list */}
        <div className="space-y-2">
          {isLoading
            ? Array(4).fill(0).map((_, i) => <SkeletonJob key={i} />)
            : filtered.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1.75} />
                <div className="font-bold text-gray-600">No jobs match your filters</div>
                <div className="text-sm text-gray-400 mt-1">Try changing the category or platform.</div>
              </div>
            ) : filtered.map(job => (
              <div key={job.id} onClick={() => setSelected(job)}
                className={`bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition
                  ${displaySelected?.id === job.id ? 'border-accent shadow-sm ring-1 ring-accent/20' : 'border-gray-200'}`}>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {job.company?.logoUrl
                      ? <img src={job.company.logoUrl} alt="" className="w-full h-full object-cover" />
                      : <Building2 className="w-4 h-4 text-gray-400" strokeWidth={2} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-bold leading-tight mb-1 truncate">{job.title}</div>
                    <div className="text-[11.5px] text-gray-500 mb-2 truncate">{job.company?.name || 'Brand Partner'}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {job.category && <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${categoryColors[job.category] || 'bg-gray-100 text-gray-500'}`}>{job.category}</span>}
                      <span className="text-[11px] text-accent font-bold">{payDisplay(job)}</span>
                    </div>
                  </div>
                </div>
                {applied.has(job.id) && (
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-green-600 font-bold">
                    <Check className="w-3 h-3" strokeWidth={3} /> Applied
                  </div>
                )}
              </div>
            ))
          }
        </div>

        {/* Job detail */}
        {displaySelected && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {displaySelected.company?.logoUrl
                    ? <img src={displaySelected.company.logoUrl} alt="" className="w-full h-full object-cover" />
                    : <Building2 className="w-6 h-6 text-gray-400" strokeWidth={1.75} />}
                </div>
                <div>
                  <h2 className="text-[18px] font-extrabold leading-tight mb-1">{displaySelected.title}</h2>
                  <div className="text-[13px] text-gray-500 font-semibold">{displaySelected.company?.name}</div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {displaySelected.category && <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${categoryColors[displaySelected.category] || 'bg-gray-100 text-gray-500'}`}>{displaySelected.category}</span>}
                    <span className="inline-flex items-center gap-1 text-[11.5px] bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-full">
                      <BadgeDollarSign className="w-3 h-3" strokeWidth={2.5} /> {payDisplay(displaySelected)}
                    </span>
                    {displaySelected.platform && (
                      <span className="inline-flex items-center gap-1 text-[11.5px] bg-gray-100 text-gray-600 font-semibold px-2.5 py-1 rounded-full">
                        <MonitorPlay className="w-3 h-3" strokeWidth={2.5} /> {displaySelected.platform}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-[11px] text-gray-400 flex-shrink-0">{formatDistanceToNow(new Date(displaySelected.createdAt), { addSuffix: true })}</div>
            </div>
            <p className="text-[13.5px] text-gray-700 leading-relaxed mb-5">{displaySelected.description}</p>
            {displaySelected.requirements?.length > 0 && (
              <div className="mb-5">
                <div className="text-[12px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">Requirements</div>
                <ul className="space-y-1.5">
                  {displaySelected.requirements.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 text-[13px] text-gray-700">
                      <Check className="w-3.5 h-3.5 text-accent flex-shrink-0" strokeWidth={3} /> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
              {applied.has(displaySelected.id) ? (
                <div className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-green-50 text-green-700 font-bold rounded-full text-[14px]">
                  <Check className="w-4 h-4" strokeWidth={3} /> Applied
                </div>
              ) : (
                <button onClick={() => setShowApply(true)} className="px-6 py-2.5 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-[14px] transition">
                  Apply Now
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Apply modal */}
      {showApply && displaySelected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowApply(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[17px] font-extrabold">Apply for Role</h3>
              <button onClick={() => setShowApply(false)} aria-label="Close" className="text-gray-400 hover:text-gray-700 transition">
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
            <textarea rows={4} placeholder="Why are you a great fit? Mention your audience, niche, past collabs…"
              className="w-full bg-bg border border-gray-200 rounded-xl p-3 text-[13px] outline-none focus:border-accent resize-none mb-4"
              value={applyMsg} onChange={e => setApplyMsg(e.target.value)} />
            <button onClick={handleApply} disabled={!applyMsg.trim() || applying}
              className="w-full h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full disabled:opacity-50 transition">
              {applying ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
