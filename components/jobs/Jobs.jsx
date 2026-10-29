'use client'
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
  Award, BadgeDollarSign, Briefcase, Building2, Check,
  ChevronDown, DollarSign, MonitorPlay, Search, SlidersHorizontal, X,
} from 'lucide-react'
import { jobApi } from '@/lib/api-client'
import { useAppStore, useAuthStore } from '@/lib/store'
import { formatDistanceToNow } from 'date-fns'
import { SkeletonJob } from '@/components/Skeleton'

// ──────────────── Filter dictionaries — single source of truth ────────────────
// ManageJobs posting form pulls from the same arrays (see ManageJobs.jsx),
// so the sidebar choices always match what brands picked when posting.
export const JOB_CATEGORIES = [
  'Brand Collaboration',
  'Paid Partnership',
  'UGC Creator',
  'Sponsored Content',
  'Affiliate Partner',
  'Brand Ambassador',
  'Livestream Host',
  'Streamer Collaboration',
  'Influencer Campaign Participant',
  'Product Reviewer',
  'Content Creator',
  'Creator Partnership',
  'Agency Recruitment',
  'Event Host',
  'Livestream Co-Host',
  'Creator Manager',
  'Community Manager',
  'Video Editor',
  'Social Media Manager',
  'Cross-Promotion Partner',
]
export const PLATFORM_OPTIONS = ['Twitch', 'Kick', 'YouTube', 'TikTok', 'Instagram', 'Multi-Platform']
export const DEAL_TYPES = [
  { value: 'per-stream', label: 'Per stream' },
  { value: 'monthly',    label: 'Monthly retainer' },
  { value: 'revenue',    label: 'Revenue share' },
  { value: 'one-off',    label: 'One-off' },
]
export const EXPERIENCE_LEVELS = [
  { value: 'beginner',     label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'expert',       label: 'Expert' },
]

const CATEGORY_COLOR_PALETTE = [
  'bg-violet-50 text-violet-700',
  'bg-emerald-50 text-emerald-700',
  'bg-rose-50 text-rose-700',
  'bg-amber-50 text-amber-700',
  'bg-cyan-50 text-cyan-700',
  'bg-sky-50 text-sky-700',
  'bg-fuchsia-50 text-fuchsia-700',
  'bg-lime-50 text-lime-700',
  'bg-orange-50 text-orange-700',
  'bg-indigo-50 text-indigo-700',
]
const categoryColors = Object.fromEntries(
  JOB_CATEGORIES.map((name, i) => [name, CATEGORY_COLOR_PALETTE[i % CATEGORY_COLOR_PALETTE.length]])
)

const dealLabel = (v) => DEAL_TYPES.find((d) => d.value === v)?.label || v
const expLabel  = (v) => EXPERIENCE_LEVELS.find((e) => e.value === v)?.label || v

const payDisplay = (job) => {
  if (!job.payMin && !job.payMax) return 'Negotiable'
  const fmt = (n) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`)
  const period = job.dealType ? dealLabel(job.dealType).toLowerCase() : job.payPeriod
  if (job.payMin && job.payMax) return `${fmt(job.payMin)}–${fmt(job.payMax)} / ${period}`
  return `${fmt(job.payMin || job.payMax)} / ${period}`
}

// ──────────────── Sidebar section (collapsible) ────────────────
function FilterSection({ icon: Icon, label, open, onToggle, options, value, onChange }) {
  return (
    <div className="border-b border-rule last:border-b-0">
      <button type="button" onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-paper transition">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted uppercase tracking-wider">
          <Icon className="w-3.5 h-3.5" strokeWidth={2.25} />
          {label}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted transition ${open ? 'rotate-180' : ''}`} strokeWidth={2.5} />
      </button>
      {open && (
        <div className="px-2.5 pb-2.5 flex flex-col gap-px max-h-[260px] overflow-y-auto">
          {/* Multi-select (QA #7): "All" clears the group; options toggle. */}
          <FilterOption checked={value.length === 0} onClick={() => onChange([])} label="All" />
          {options.map((opt) => {
            const v = typeof opt === 'string' ? opt : opt.value
            const l = typeof opt === 'string' ? opt : opt.label
            const on = value.includes(v)
            return <FilterOption key={v} checked={on} onClick={() => onChange(on ? value.filter((x) => x !== v) : [...value, v])} label={l} />
          })}
        </div>
      )}
    </div>
  )
}

function FilterOption({ checked, onClick, label }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] text-left transition select-none
        ${checked ? 'bg-accent-lt text-accent-dk font-medium' : 'text-muted hover:bg-paper hover:text-ink'}`}>
      <span className={`w-4 h-4 rounded border-[1.5px] flex-shrink-0 flex items-center justify-center
        ${checked ? 'bg-accent border-accent text-white' : 'border-gray-300 bg-white'}`}>
        {checked && <Check className="w-3 h-3" strokeWidth={3} />}
      </span>
      {label}
    </button>
  )
}

// ──────────────── Page ────────────────
export default function JobsPage() {
  const { showToast } = useAppStore()
  const { user } = useAuthStore()
  const isCompany = user?.role === 'company' || user?.role === 'admin'

  // Each group holds several values: OR within a group, AND across groups.
  const [filters, setFilters] = useState({ category: [], platform: [], dealType: [], experienceLevel: [] })
  const [openSec, setOpenSec] = useState({ category: true, platform: true, deal: true, exp: false })
  const [query, setQuery] = useState('')
  const [sortVal, setSortVal] = useState('recent')

  const [selected, setSelected] = useState(null)
  const [applyMsg, setApplyMsg] = useState('')
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(new Set())

  const { data: dbJobs, isLoading } = useSWR('jobs', async () => {
    const result = await jobApi.list({ isActive: true, limit: 50 })
    return result.items || []
  })

  const filtered = useMemo(() => {
    const list = (dbJobs || []).filter((j) => {
      if (filters.category.length && !filters.category.includes(j.category)) return false
      if (filters.platform.length && !filters.platform.includes(j.platform)) return false
      if (filters.dealType.length && !filters.dealType.includes(j.dealType)) return false
      if (filters.experienceLevel.length && !filters.experienceLevel.includes(j.experienceLevel)) return false
      if (query) {
        const q = query.toLowerCase()
        if (!(`${j.title} ${j.company?.name || ''}`.toLowerCase().includes(q))) return false
      }
      return true
    })
    if (sortVal === 'pay-high') list.sort((a, b) => (b.payMax || b.payMin || 0) - (a.payMax || a.payMin || 0))
    if (sortVal === 'pay-low')  list.sort((a, b) => (a.payMin || a.payMax || 0) - (b.payMin || b.payMax || 0))
    return list
  }, [dbJobs, filters, query, sortVal])

  const activeTags = []
  filters.category.forEach((v) => activeTags.push({ key: 'category', value: v, label: v }))
  filters.platform.forEach((v) => activeTags.push({ key: 'platform', value: v, label: v }))
  filters.dealType.forEach((v) => activeTags.push({ key: 'dealType', value: v, label: dealLabel(v) }))
  filters.experienceLevel.forEach((v) => activeTags.push({ key: 'experienceLevel', value: v, label: expLabel(v) }))

  const clearAll = () => {
    setFilters({ category: [], platform: [], dealType: [], experienceLevel: [] })
    setQuery('')
    setSortVal('recent')
  }

  const handleApply = async () => {
    if (!applyMsg.trim() || !selected) return
    setApplying(true)
    try {
      await jobApi.apply(selected.id, { message: applyMsg })
      setApplied((s) => new Set([...s, selected.id]))
      showToast('Application sent')
      setSelected(null); setApplyMsg('')
    } catch (err) {
      if (err.code === 'ALREADY_APPLIED') {
        setApplied((s) => new Set([...s, selected.id]))
        showToast('You already applied', 'error')
      } else showToast(err.message || 'Could not apply', 'error')
    }
    setApplying(false)
  }

  return (
    <div className="max-w-[1180px] mx-auto px-4 py-7">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-display text-[26px] font-bold text-ink">Jobs</h1>
          <p className="text-[14px] text-muted mt-0.5">Find brand deals, partnerships, and creator opportunities.</p>
        </div>
        {isCompany && (
          <Link href="/jobs/manage"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-ink hover:bg-black text-white text-[13px] font-semibold rounded-full transition">
            <Briefcase className="w-3.5 h-3.5" strokeWidth={2.5} />
            Manage my jobs
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-5 items-start">
        {/* Sidebar */}
        <aside className="bg-white border border-rule rounded-2xl overflow-hidden md:sticky md:top-20">
          <div className="flex items-center justify-between px-4 py-3 border-b border-rule">
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink">
              <SlidersHorizontal className="w-4 h-4 text-sl-purple" strokeWidth={2.25} />
              Filters
            </span>
            <button type="button" onClick={clearAll}
              className="text-[11px] text-muted hover:text-sl-purple transition">
              Clear all
            </button>
          </div>
          <FilterSection icon={Briefcase} label="Job type" open={openSec.category}
            onToggle={() => setOpenSec((s) => ({ ...s, category: !s.category }))}
            options={JOB_CATEGORIES}
            value={filters.category}
            onChange={(v) => setFilters((f) => ({ ...f, category: v }))} />
          <FilterSection icon={MonitorPlay} label="Platform" open={openSec.platform}
            onToggle={() => setOpenSec((s) => ({ ...s, platform: !s.platform }))}
            options={PLATFORM_OPTIONS}
            value={filters.platform}
            onChange={(v) => setFilters((f) => ({ ...f, platform: v }))} />
          <FilterSection icon={DollarSign} label="Deal type" open={openSec.deal}
            onToggle={() => setOpenSec((s) => ({ ...s, deal: !s.deal }))}
            options={DEAL_TYPES}
            value={filters.dealType}
            onChange={(v) => setFilters((f) => ({ ...f, dealType: v }))} />
          <FilterSection icon={Award} label="Experience" open={openSec.exp}
            onToggle={() => setOpenSec((s) => ({ ...s, exp: !s.exp }))}
            options={EXPERIENCE_LEVELS}
            value={filters.experienceLevel}
            onChange={(v) => setFilters((f) => ({ ...f, experienceLevel: v }))} />
        </aside>

        {/* Main column */}
        <div className="min-w-0">
          {/* Search + sort */}
          <div className="flex flex-wrap items-center gap-2.5 mb-3.5">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" strokeWidth={2.25} />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jobs or agencies…"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-rule rounded-xl text-[14px] outline-none focus:border-sl-purple transition" />
            </div>
            <select value={sortVal} onChange={(e) => setSortVal(e.target.value)}
              className="text-[13px] px-3 py-2.5 bg-white border border-rule rounded-xl outline-none">
              <option value="recent">Most recent</option>
              <option value="pay-high">Highest pay</option>
              <option value="pay-low">Lowest pay</option>
            </select>
          </div>

          {/* Active tags */}
          {activeTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {activeTags.map((t) => (
                <button key={`${t.key}:${t.value}`} onClick={() => setFilters((f) => ({ ...f, [t.key]: f[t.key].filter((x) => x !== t.value) }))}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-lt hover:bg-purple-100 text-accent-dk rounded-full text-[12px] font-medium transition">
                  {t.label}
                  <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              ))}
            </div>
          )}

          {/* Result count */}
          <div className="text-[13px] text-muted mb-3.5">
            <strong className="text-ink">{filtered.length}</strong> job{filtered.length === 1 ? '' : 's'} found
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-2.5">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => <SkeletonJob key={i} />)
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-rule rounded-xl p-12 text-center">
                <Briefcase className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1.75} />
                <div className="font-semibold text-ink">No jobs match your filters</div>
                <div className="text-sm text-muted mt-1">Try clearing one of the filters.</div>
              </div>
            ) : filtered.map((job) => (
              <JobCard key={job.id}
                job={job}
                applied={applied.has(job.id)}
                onApply={() => setSelected(job)} />
            ))}
          </div>
        </div>
      </div>

      {/* Apply modal — also serves as detail view */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 p-6 border-b border-rule">
              <div className="w-12 h-12 rounded-lg bg-paper border border-rule flex items-center justify-center overflow-hidden flex-shrink-0">
                {selected.company?.logoUrl
                  ? <img src={selected.company.logoUrl} alt="" className="w-full h-full object-cover" />
                  : <Building2 className="w-6 h-6 text-gray-400" strokeWidth={1.75} />}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-display text-[18px] font-bold text-ink leading-tight">{selected.title}</h2>
                <div className="text-[13px] text-muted mt-0.5">{selected.company?.name}</div>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Close" className="text-muted hover:text-ink">
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {selected.category && <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${categoryColors[selected.category] || 'bg-gray-100 text-gray-500'}`}>{selected.category}</span>}
                {selected.platform && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-accent-lt text-accent-dk">{selected.platform}</span>}
                {selected.dealType && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">{dealLabel(selected.dealType)}</span>}
                {selected.experienceLevel && <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-paper text-muted">{expLabel(selected.experienceLevel)}</span>}
                <span className="inline-flex items-center gap-1 text-[11.5px] bg-green-50 text-green-700 font-bold px-2.5 py-1 rounded-full">
                  <BadgeDollarSign className="w-3 h-3" strokeWidth={2.5} /> {payDisplay(selected)}
                </span>
              </div>
              {selected.description && (
                <p className="text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
              )}
              {selected.requirements?.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Requirements</div>
                  <ul className="space-y-1">
                    {selected.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13.5px] text-gray-700">
                        <Check className="w-3.5 h-3.5 text-sl-purple flex-shrink-0 mt-1" strokeWidth={3} /> {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {!applied.has(selected.id) && (
                <div className="pt-2 border-t border-rule">
                  <div className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2 mt-2">Your application</div>
                  <textarea rows={4} placeholder="Why are you a great fit? Mention your audience, niche, past collabs…"
                    className="w-full bg-paper border border-rule rounded-xl p-3 text-[13.5px] outline-none focus:border-sl-purple resize-none mb-3"
                    value={applyMsg} onChange={(e) => setApplyMsg(e.target.value)} />
                  <button onClick={handleApply} disabled={!applyMsg.trim() || applying}
                    className="w-full h-11 bg-streamlink text-white font-semibold rounded-full text-[14px] transition disabled:opacity-50 shadow-[0_6px_18px_rgba(232,52,122,0.25)]">
                    {applying ? 'Submitting…' : 'Submit application'}
                  </button>
                </div>
              )}
              {applied.has(selected.id) && (
                <div className="pt-3 border-t border-rule">
                  <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-full text-[13.5px]">
                    <Check className="w-4 h-4" strokeWidth={3} /> Application submitted
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ──────────────── Card ────────────────
function JobCard({ job, applied, onApply }) {
  return (
    <div className="bg-white border border-rule rounded-2xl p-4 flex items-start gap-3.5 hover:border-[#C4BDE8] hover:shadow-[0_2px_16px_rgba(124,58,237,0.07)] transition cursor-pointer"
      onClick={onApply}>
      <div className="w-[42px] h-[42px] rounded-xl bg-accent-lt text-accent-dk flex items-center justify-center flex-shrink-0 overflow-hidden">
        {job.company?.logoUrl
          ? <img src={job.company.logoUrl} alt="" className="w-full h-full object-cover" />
          : <Building2 className="w-5 h-5" strokeWidth={2} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-0.5">
          <div className="font-display text-[15px] font-semibold text-ink leading-tight truncate">{job.title}</div>
          <div className="text-[15px] font-semibold text-ink whitespace-nowrap">{payDisplay(job)}</div>
        </div>
        <div className="text-[12px] text-muted truncate mb-2.5">{job.company?.name || 'Brand Partner'}</div>
        <div className="flex flex-wrap gap-1.5">
          {job.platform && <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-accent-lt text-accent-dk border border-purple-200">{job.platform}</span>}
          {job.dealType && <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{dealLabel(job.dealType)}</span>}
          {job.category && <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-paper text-muted border border-rule">{job.category}</span>}
          {job.experienceLevel && <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-paper text-muted border border-rule">{expLabel(job.experienceLevel)}</span>}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        {applied ? (
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-green-600 px-3 py-1.5">
            <Check className="w-3.5 h-3.5" strokeWidth={3} /> Applied
          </span>
        ) : (
          <button onClick={(e) => { e.stopPropagation(); onApply(); }}
            className="text-[13px] font-bold px-4 py-1.5 rounded-full btn-gradient text-white transition">
            Apply
          </button>
        )}
        <span className="text-[11px] text-muted">{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
      </div>
    </div>
  )
}
