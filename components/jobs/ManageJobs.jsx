'use client'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from '@/lib/router-shim'
import {
  Briefcase,
  Building2,
  Loader2,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { companyApi, jobApi } from '@/lib/api-client'
import { useAppStore, useAuthStore } from '@/lib/store'

const JOB_TYPES = ['Sponsored Stream', 'Ambassador', 'Full Time', 'Contract', 'Event']
const JOB_CATEGORIES = [
  'Influencer Campaigns',
  'Affiliate Marketing',
  'Live Streaming',
  'Adult Content Operations',
  'Coin Reseller (Live Apps)',
]
const PLATFORMS_FIELD = ['Twitch', 'Kick', 'YouTube', 'Multi-Platform']
const PAY_PERIODS = ['stream', 'month', 'year', 'event']

export default function ManageJobsPage() {
  const { user } = useAuthStore()
  const { showToast } = useAppStore()
  const navigate = useNavigate()

  const [companies, setCompanies] = useState(null)
  const [selected, setSelected] = useState(null)   // company object
  const [jobs, setJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [applicationsFor, setApplicationsFor] = useState(null) // job object

  const isCompany = user?.role === 'company' || user?.role === 'admin'

  useEffect(() => {
    if (!isCompany) return
    companyApi.list(undefined, 100)
      .then((r) => {
        const mine = (r?.items || []).filter((c) => c.ownerId === user?.id)
        setCompanies(mine)
        if (mine.length > 0) setSelected(mine[0])
      })
      .catch((e) => { setCompanies([]); showToast(e.message || 'Failed', 'error') })
  }, [isCompany, user?.id])

  const loadJobs = async () => {
    if (!selected?.id) return
    setLoadingJobs(true)
    try {
      const res = await jobApi.list({ companyId: selected.id, limit: 50 })
      setJobs(res.items || [])
    } catch (e) { showToast(e.message || 'Failed', 'error') }
    setLoadingJobs(false)
  }
  useEffect(() => { loadJobs() }, [selected?.id])

  const deleteJob = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? This cannot be undone.`)) return
    try {
      await jobApi.delete(job.id)
      showToast('Job deleted')
      loadJobs()
    } catch (e) { showToast(e.message || 'Failed', 'error') }
  }

  if (!isCompany) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
        <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
        <div className="font-extrabold text-[16px]">Only for companies</div>
        <p className="text-sm text-gray-400 mt-1 mb-5">Create a company page to post jobs and manage applicants.</p>
        <button onClick={() => navigate('/register/company')}
          className="px-5 py-2 bg-accent hover:bg-accent-dk text-white font-bold text-[13px] rounded-full">
          Create a brand page
        </button>
      </div>
    )
  }

  if (companies === null) {
    return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-accent animate-spin" /></div>
  }

  if (companies.length === 0) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
        <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
        <div className="font-extrabold text-[16px]">No company pages yet</div>
        <p className="text-sm text-gray-400 mt-1 mb-5">You need a company page before you can post jobs.</p>
        <Link to="/companies" className="px-5 py-2 bg-accent hover:bg-accent-dk text-white font-bold text-[13px] rounded-full inline-flex">
          Create a company page
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h1 className="inline-flex items-center gap-2 text-[22px] font-extrabold tracking-tight">
          <Briefcase className="w-5 h-5" strokeWidth={2.5} />
          Manage Jobs
        </h1>
        <button
          onClick={() => setShowNew(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white text-[13px] font-bold rounded-full transition">
          <Plus className="w-4 h-4" strokeWidth={2.5} /> Post a job
        </button>
      </div>

      {/* Company picker */}
      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
        {companies.map((c) => (
          <button key={c.id} onClick={() => setSelected(c)}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12.5px] font-bold transition
              ${selected?.id === c.id ? 'bg-accent text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
            {c.logoUrl
              ? <img src={c.logoUrl} alt="" className="w-4 h-4 rounded" />
              : <Building2 className="w-3.5 h-3.5" strokeWidth={2.25} />}
            {c.name}
          </button>
        ))}
      </div>

      {/* Jobs table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loadingJobs ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-accent animate-spin" /></div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-14">
            <Briefcase className="w-7 h-7 text-gray-300 mx-auto mb-2" strokeWidth={1.5} />
            <div className="font-bold text-gray-600">No jobs for this company</div>
            <p className="text-sm text-gray-400 mt-1">Click "Post a job" to create one.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead>
                <tr className="text-[10.5px] font-extrabold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Category</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3">Platform</th>
                  <th className="text-left px-4 py-3">Pay</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Posted</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold">{j.title}</td>
                    <td className="px-4 py-3 text-gray-600">{j.category || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{j.jobType || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{j.platform || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {j.payMin ? `$${j.payMin}–${j.payMax || j.payMin} / ${j.payPeriod || 'stream'}` : 'Negotiable'}
                    </td>
                    <td className="px-4 py-3">
                      {j.isActive
                        ? <span className="text-[10.5px] font-extrabold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                        : <span className="text-[10.5px] font-extrabold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-[12px]">{formatDistanceToNow(new Date(j.createdAt), { addSuffix: true })}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1.5">
                        <button onClick={() => setApplicationsFor(j)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-accent border border-accent/30 hover:bg-accent-lt rounded-full transition">
                          <Users className="w-3 h-3" strokeWidth={2.25} /> Applicants
                        </button>
                        <button onClick={() => deleteJob(j)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-red-600 border border-red-200 hover:bg-red-50 rounded-full transition">
                          <Trash2 className="w-3 h-3" strokeWidth={2.25} /> Delete
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

      {/* New job modal */}
      {showNew && selected && (
        <NewJobModal
          company={selected}
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); loadJobs() }}
          showToast={showToast}
        />
      )}

      {/* Applications modal */}
      {applicationsFor && (
        <ApplicationsModal
          job={applicationsFor}
          onClose={() => setApplicationsFor(null)}
          showToast={showToast}
        />
      )}
    </div>
  )
}

function NewJobModal({ company, onClose, onCreated, showToast }) {
  const [form, setForm] = useState({
    title: '', description: '',
    jobType: '', category: '', platform: '',
    payMin: '', payMax: '', payPeriod: 'month',
    requirements: [], reqInput: '',
    isActive: true,
  })
  const [submitting, setSubmitting] = useState(false)

  const addReq = () => {
    if (!form.reqInput.trim()) return
    setForm((f) => ({ ...f, requirements: [...f.requirements, f.reqInput.trim()], reqInput: '' }))
  }
  const removeReq = (i) => setForm((f) => ({ ...f, requirements: f.requirements.filter((_, x) => x !== i) }))

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await jobApi.create({
        companyId: company.id,
        title: form.title.trim(),
        description: form.description || null,
        jobType: form.jobType || null,
        category: form.category || null,
        platform: form.platform || null,
        payMin: form.payMin ? Number(form.payMin) : null,
        payMax: form.payMax ? Number(form.payMax) : null,
        payPeriod: form.payPeriod || null,
        requirements: form.requirements.length ? form.requirements : null,
        isActive: form.isActive,
      })
      showToast('Job posted')
      onCreated()
    } catch (err) {
      showToast(err.message || 'Failed', 'error')
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-[15px] font-extrabold">Post a job for {company.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" strokeWidth={2.5} /></button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <Field label="Title *">
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Brand Ambassador — Gaming Peripherals"
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent">
              <option value="">—</option>
              {JOB_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}
                className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent">
                <option value="">—</option>
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Platform">
              <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })}
                className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent">
                <option value="">—</option>
                {PLATFORMS_FIELD.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Pay min ($)">
              <input type="number" min={0} value={form.payMin} onChange={(e) => setForm({ ...form, payMin: e.target.value })}
                className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
            </Field>
            <Field label="Pay max ($)">
              <input type="number" min={0} value={form.payMax} onChange={(e) => setForm({ ...form, payMax: e.target.value })}
                className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
            </Field>
            <Field label="Pay period">
              <select value={form.payPeriod} onChange={(e) => setForm({ ...form, payPeriod: e.target.value })}
                className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent">
                {PAY_PERIODS.map((p) => <option key={p} value={p}>per {p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What the role is, what you're offering, expectations…"
              className="w-full bg-bg border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-accent resize-none" />
          </Field>
          <Field label="Requirements">
            <div className="flex gap-2 mb-2">
              <input value={form.reqInput} onChange={(e) => setForm({ ...form, reqInput: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addReq())}
                placeholder="e.g. 10K+ followers"
                className="flex-1 h-9 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
              <button type="button" onClick={addReq}
                className="px-3 h-9 bg-gray-100 text-gray-700 font-bold text-[12px] rounded-lg hover:bg-gray-200">Add</button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {form.requirements.map((r, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-lt text-accent text-[11.5px] font-bold rounded-full">
                  {r}
                  <button type="button" onClick={() => removeReq(i)} className="hover:text-red-600">
                    <X className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                </span>
              ))}
            </div>
          </Field>
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 text-[12.5px] font-semibold">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="w-4 h-4" />
              Publish immediately
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose}
              className="px-4 h-10 border border-gray-200 text-gray-600 font-bold text-[12.5px] rounded-full">Cancel</button>
            <button type="submit" disabled={!form.title.trim() || submitting}
              className="inline-flex items-center gap-1.5 px-5 h-10 bg-accent hover:bg-accent-dk text-white font-bold text-[12.5px] rounded-full disabled:opacity-50">
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} /> : null}
              Post job
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ApplicationsModal({ job, onClose, showToast }) {
  const [list, setList] = useState(null)
  useEffect(() => {
    jobApi.applications(job.id)
      .then((items) => setList(items || []))
      .catch((e) => { showToast(e.message || 'Failed', 'error'); setList([]) })
  }, [job.id])

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-[15px] font-extrabold">Applicants</h3>
            <div className="text-[11px] text-gray-400 mt-0.5">{job.title}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" strokeWidth={2.5} /></button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {list === null ? (
            <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 text-accent animate-spin" /></div>
          ) : list.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">No applications yet.</div>
          ) : list.map((a) => (
            <div key={a.id} className="px-5 py-4 border-b border-gray-50 last:border-0">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-400 text-white font-bold text-xs flex items-center justify-center overflow-hidden flex-shrink-0">
                  {a.applicant.avatarUrl
                    ? <img src={a.applicant.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : (a.applicant.displayName || '??').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/profile/${a.applicant.id}`} className="text-[13.5px] font-extrabold hover:underline">
                      {a.applicant.displayName}
                    </Link>
                    <span className="text-[11px] text-gray-400">@{a.applicant.handle}</span>
                    <span className="text-[10px] text-gray-300">· {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</span>
                  </div>
                  {a.message && <p className="text-[12.5px] text-gray-700 leading-relaxed mt-1.5 whitespace-pre-wrap">{a.message}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11.5px] font-bold text-gray-500 mb-1">{label}</label>
      {children}
    </div>
  )
}
