'use client'
import { useEffect, useState } from 'react'
import { BadgeCheck, Building2, Check, ExternalLink, Loader2, Pencil, Plus, Search, Star, Users, X } from 'lucide-react'
import { companyApi, reviewApi } from '@/lib/api-client'
import { useAppStore, useAuthStore } from '@/lib/store'
import StarRating from '@/components/StarRating'
import ImageUpload from '@/components/ImageUpload'
import { formatDistanceToNow } from 'date-fns'

const FILTERS = ['All', 'Sponsors', 'Esports', 'Agencies', 'Hardware', 'Streaming']
const INDUSTRIES = ['Esports', 'Gaming Hardware', 'Energy & Beverages', 'Streaming Platform', 'Talent Agency', 'Game Publisher', 'Apparel', 'Tech & Software', 'Other']
const PARTNERSHIP_TYPES = ['Sponsored Streams', 'Brand Ambassadors', 'Product Reviews', 'Event Coverage', 'Long-term Deals', 'Affiliate Programs']

export default function CompaniesPage() {
  const { showToast } = useAppStore()
  const { user } = useAuthStore()
  const [companies, setCompanies] = useState([])
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [companyTab, setCompanyTab] = useState('Overview')
  const [reviewData, setReviewData] = useState(null)
  const [myReviewRating, setMyReviewRating] = useState(0)
  const [myReviewContent, setMyReviewContent] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [followed, setFollowed] = useState(new Set())
  const [createForm, setCreateForm] = useState({ name: '', industry: '', website: '', description: '', location: '', logoUrl: '', bannerUrl: '', looking_for: [] })
  const [creating, setCreating] = useState(false)
  const [searchQ, setSearchQ] = useState('')

  const canEditSelected = Boolean(selected && user?.id && selected.ownerId === user.id) || user?.role === 'admin'

  const openEdit = () => {
    if (!selected) return
    setEditForm({
      name: selected.name || '',
      industry: selected.industry || '',
      website: selected.website || '',
      description: selected.description || '',
      location: selected.location || '',
      logoUrl: selected.logoUrl || '',
      bannerUrl: selected.bannerUrl || '',
      looking_for: selected.lookingFor || [],
    })
    setShowEdit(true)
  }

  const saveEdit = async () => {
    if (!selected || !editForm) return
    setSavingEdit(true)
    try {
      const updated = await companyApi.update(selected.id, {
        name: editForm.name.trim() || null,
        industry: editForm.industry || null,
        website: editForm.website || null,
        description: editForm.description || null,
        location: editForm.location || null,
        logoUrl: editForm.logoUrl || null,
        bannerUrl: editForm.bannerUrl || null,
        lookingFor: editForm.looking_for,
      })
      setCompanies((cs) => cs.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)))
      setSelected((s) => ({ ...s, ...updated }))
      showToast('Company page updated')
      setShowEdit(false)
    } catch (err) {
      showToast(err.message || 'Could not save', 'error')
    }
    setSavingEdit(false)
  }

  const fetchCompanies = async () => {
    try {
      const result = await companyApi.list(undefined, 50)
      const all = result.items || []
      setCompanies(all)
      setSelected(all[0] || null)
    } catch (err) {
      showToast(err.message || 'Could not load companies', 'error')
    }
  }

  const toggleFollow = (id, name) => {
    setFollowed(s => {
      const next = new Set(s)
      if (next.has(id)) { next.delete(id); showToast(`Unfollowed ${name}`) }
      else { next.add(id); showToast(`Following ${name}`) }
      return next
    })
  }

  const handleCreate = async () => {
    if (!createForm.name.trim() || !createForm.industry) return
    setCreating(true)
    try {
      await companyApi.create({
        name: createForm.name,
        industry: createForm.industry,
        website: createForm.website || null,
        description: createForm.description || null,
        location: createForm.location || null,
        logoUrl: createForm.logoUrl || null,
        bannerUrl: createForm.bannerUrl || null,
        lookingFor: createForm.looking_for,
      })
      showToast('Company page created')
      setShowCreate(false)
      setCreateForm({ name: '', industry: '', website: '', description: '', location: '', logoUrl: '', bannerUrl: '', looking_for: [] })
      fetchCompanies()
    } catch (err) {
      if (err.code === 'SLUG_TAKEN') showToast('A company with that name exists', 'error')
      else showToast(err.message || 'Could not create company', 'error')
    }
    setCreating(false)
  }

  const togglePartnerType = (pt) => {
    setCreateForm(f => ({
      ...f,
      looking_for: f.looking_for.includes(pt)
        ? f.looking_for.filter(x => x !== pt)
        : [...f.looking_for, pt]
    }))
  }

  useEffect(() => { fetchCompanies() }, [])

  useEffect(() => {
    if (!selected?.slug || companyTab !== 'Reviews') return
    let cancelled = false
    Promise.all([reviewApi.companySummary(selected.slug), reviewApi.companyList(selected.slug, 50)])
      .then(([s, list]) => { if (!cancelled) setReviewData({ summary: s, reviews: list || [] }) })
      .catch(() => { if (!cancelled) setReviewData({ summary: null, reviews: [] }) })
    return () => { cancelled = true }
  }, [selected?.slug, companyTab])

  const submitReview = async () => {
    if (!selected?.slug || myReviewRating < 1) return
    setSubmittingReview(true)
    try {
      await reviewApi.upsertCompany(selected.slug, { rating: myReviewRating, content: myReviewContent || null })
      showToast('Review saved')
      setMyReviewRating(0)
      setMyReviewContent('')
      const [s, list] = await Promise.all([reviewApi.companySummary(selected.slug), reviewApi.companyList(selected.slug, 50)])
      setReviewData({ summary: s, reviews: list || [] })
    } catch (err) {
      if (err.code === 'SELF_REVIEW') showToast('You cannot review your own company', 'error')
      else showToast(err.message || 'Could not save review', 'error')
    }
    setSubmittingReview(false)
  }

  const filterMap = { 'Sponsors': ['Energy & Beverages', 'Tech & Software'], 'Esports': ['Esports'], 'Agencies': ['Talent Agency'], 'Hardware': ['Gaming Hardware'], 'Streaming': ['Streaming Platform'] }
  const filtered = companies.filter(c => {
    const matchFilter = filter === 'All' || filterMap[filter]?.includes(c.industry)
    const matchSearch = !searchQ || c.name.toLowerCase().includes(searchQ.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="max-w-[1100px] mx-auto px-4 py-5">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4">
        <div className="space-y-4">
          {/* Header bar */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" strokeWidth={2.5} />
              <input type="text" placeholder="Search companies…"
                className="w-full h-9 bg-bg border border-gray-200 rounded-full pl-9 pr-4 text-[13px] outline-none focus:border-accent"
                value={searchQ} onChange={e => setSearchQ(e.target.value)} />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-[11.5px] font-bold transition ${filter === f ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{f}</button>
              ))}
            </div>
            <button onClick={() => setShowCreate(true)} className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-dk text-white font-bold text-[12.5px] rounded-full transition whitespace-nowrap">
              <Plus className="w-3.5 h-3.5" strokeWidth={3} /> Create Page
            </button>
          </div>

          {/* Selected company detail */}
          {selected && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="relative h-32 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600">
                {selected.bannerUrl && (
                  <img src={selected.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                )}
              </div>
              <div className="px-6 pb-2 border-b border-gray-100">
                <div className="flex items-end justify-between -mt-10 mb-3">
                  <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                    {selected.logoUrl
                      ? <img src={selected.logoUrl} alt="" className="w-full h-full object-cover" />
                      : <Building2 className="w-9 h-9 text-gray-400" strokeWidth={1.75} />}
                  </div>
                  <div className="flex items-center gap-2">
                    {canEditSelected && (
                      <button onClick={openEdit}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-full font-bold text-[13px] hover:border-gray-400 transition">
                        <Pencil className="w-3.5 h-3.5" strokeWidth={2.5} /> Edit
                      </button>
                    )}
                    <button onClick={() => toggleFollow(selected.id, selected.name)}
                      className={`px-5 py-2 rounded-full font-bold text-[13px] inline-flex items-center gap-1.5 transition
                        ${followed.has(selected.id) ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'border-2 border-accent text-accent hover:bg-accent hover:text-white'}`}>
                      {followed.has(selected.id)
                        ? <><Check className="w-3.5 h-3.5" strokeWidth={3} /> Following</>
                        : <><Plus className="w-3.5 h-3.5" strokeWidth={3} /> Follow</>}
                    </button>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[18px] font-extrabold">{selected.name}</h2>
                    {selected.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] bg-blue-50 text-blue-600 font-extrabold px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-3 h-3" fill="currentColor" strokeWidth={0} /> Verified
                      </span>
                    )}
                  </div>
                  <div className="text-[12.5px] text-gray-400 mt-0.5">{selected.industry}{selected.location ? ` · ${selected.location}` : ''}</div>
                  <div className="flex items-center gap-3 mt-2 text-[12px] text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" strokeWidth={2.5} />
                      {(selected.followersCount || 0).toLocaleString()} followers
                    </span>
                    {selected.website && (
                      <a href={selected.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                        <ExternalLink className="w-3.5 h-3.5" strokeWidth={2.5} /> Website
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-px mt-3">
                  {['Overview','Open Deals','Reviews','Updates'].map(t => (
                    <button key={t} onClick={() => setCompanyTab(t)}
                      className={`relative px-5 py-2.5 text-[13px] font-bold transition ${companyTab === t ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                      {t}
                      {companyTab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                {companyTab === 'Overview' && (
                  <div className="space-y-4">
                    <p className="text-[13.5px] text-gray-700 leading-relaxed">{selected.description || 'No description yet.'}</p>
                    {selected.lookingFor?.length > 0 && (
                      <div>
                        <div className="text-[12px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">Looking For</div>
                        <div className="flex flex-wrap gap-2">
                          {selected.lookingFor.map(l => <span key={l} className="px-3 py-1.5 bg-accent-lt text-accent font-bold text-[12px] rounded-full">{l}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {companyTab === 'Open Deals' && (
                  <div className="text-center py-8 text-[13px] text-gray-400">No open deals listed yet.</div>
                )}
                {companyTab === 'Reviews' && (
                  <div>
                    {!reviewData ? (
                      <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 text-accent animate-spin" strokeWidth={2.5} /></div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[24px] font-extrabold text-amber-500">
                                {reviewData.summary?.averageRating ? Number(reviewData.summary.averageRating).toFixed(1) : '—'}
                              </span>
                              <StarRating value={reviewData.summary?.averageRating || 0} size={16} />
                            </div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{reviewData.summary?.reviewCount ?? 0} review{reviewData.summary?.reviewCount === 1 ? '' : 's'}</div>
                          </div>
                        </div>

                        <div className="mb-5 p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                          <div className="text-[12px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">Write a review</div>
                          <div className="flex items-center gap-3 mb-2">
                            <StarRating value={myReviewRating} onChange={setMyReviewRating} size={20} />
                            <span className="text-[12px] text-gray-400">{myReviewRating ? `${myReviewRating}/5` : 'Tap to rate'}</span>
                          </div>
                          <textarea
                            rows={2}
                            value={myReviewContent}
                            onChange={(e) => setMyReviewContent(e.target.value)}
                            placeholder="Share your experience with this company…"
                            className="w-full bg-white border border-gray-200 rounded-lg p-2.5 text-[12.5px] outline-none focus:border-accent resize-none"
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              onClick={submitReview}
                              disabled={myReviewRating < 1 || submittingReview}
                              className="px-4 py-1.5 bg-accent hover:bg-accent-dk text-white font-bold text-[12px] rounded-full transition disabled:opacity-50 inline-flex items-center gap-1.5">
                              {submittingReview ? <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2.5} /> : null}
                              Submit
                            </button>
                          </div>
                        </div>

                        {reviewData.reviews.length === 0 ? (
                          <div className="text-center py-6 text-[13px] text-gray-400">
                            <Star className="w-5 h-5 text-gray-300 mx-auto mb-1.5" strokeWidth={1.5} />
                            No reviews yet — be the first.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {reviewData.reviews.map((r) => (
                              <div key={r.id} className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-400 flex items-center justify-center text-white font-bold text-[10px] overflow-hidden flex-shrink-0">
                                  {r.reviewer.avatarUrl
                                    ? <img src={r.reviewer.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    : (r.reviewer.displayName || '??').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[12.5px] font-extrabold">{r.reviewer.displayName}</span>
                                    <span className="text-[10.5px] text-gray-400">@{r.reviewer.handle}</span>
                                    <span className="text-[10.5px] text-gray-300">· {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                                  </div>
                                  <div className="mt-0.5"><StarRating value={r.rating} size={12} /></div>
                                  {r.content && <p className="text-[12.5px] text-gray-700 mt-1.5 leading-relaxed whitespace-pre-wrap">{r.content}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
                {companyTab === 'Updates' && (
                  <div className="text-center py-8 text-[13px] text-gray-400">No updates yet.</div>
                )}
              </div>
            </div>
          )}

          {/* Companies grid */}
          <div className="grid grid-cols-2 gap-3">
            {filtered.length === 0 && (
              <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-10 text-center">
                <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" strokeWidth={1.75} />
                <div className="font-bold text-gray-600">No company pages yet</div>
                <div className="text-sm text-gray-400 mt-1">Be the first to create one.</div>
              </div>
            )}
            {filtered.map(c => (
              <div key={c.id} onClick={() => { setSelected(c); setCompanyTab('Overview') }}
                className={`bg-white border rounded-xl p-4 cursor-pointer hover:shadow-md transition ${selected?.id === c.id ? 'border-accent' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {c.logoUrl
                      ? <img src={c.logoUrl} alt="" className="w-full h-full object-cover" />
                      : <Building2 className="w-4 h-4 text-gray-400" strokeWidth={2} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold flex items-center gap-1">
                      <span className="truncate">{c.name}</span>
                      {c.isVerified && <BadgeCheck className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" fill="currentColor" strokeWidth={0} />}
                    </div>
                    <div className="text-[11px] text-gray-400 truncate">{c.industry || '—'}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center gap-1 text-[11.5px] text-gray-400">
                    <Users className="w-3 h-3" strokeWidth={2.5} />
                    {(c.followersCount || 0).toLocaleString()}
                  </span>
                  <button onClick={e => { e.stopPropagation(); toggleFollow(c.id, c.name) }}
                    className={`inline-flex items-center gap-1 text-[11.5px] font-bold px-3 py-1 rounded-full border transition
                      ${followed.has(c.id) ? 'border-gray-200 text-gray-400' : 'border-accent text-accent hover:bg-accent hover:text-white'}`}>
                    {followed.has(c.id)
                      ? <><Check className="w-3 h-3" strokeWidth={3} /> Following</>
                      : <><Plus className="w-3 h-3" strokeWidth={3} /> Follow</>}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-3">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="font-extrabold text-[13.5px] mb-3">Why create a page?</div>
            {['Find creators that match your brand', 'Post deals and open roles', 'Build your creator community', 'Track applications in one place'].map((t, i) => (
              <div key={i} className="flex items-start gap-2 mb-2">
                <Check className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" strokeWidth={3} />
                <span className="text-[12.5px] text-gray-600">{t}</span>
              </div>
            ))}
            <button onClick={() => setShowCreate(true)} className="w-full h-9 bg-accent hover:bg-accent-dk text-white font-bold text-[13px] rounded-full mt-2 transition">Create Company Page</button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
            <div className="font-extrabold text-[13px] mb-3">Companies You Follow</div>
            {followed.size === 0 ? (
              <div className="text-[12px] text-gray-400 text-center py-3">Follow companies to see them here</div>
            ) : (
              [...followed].map(id => {
                const c = companies.find(x => x.id === id)
                if (!c) return null
                return (
                  <div key={id} className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
                    <div className="w-6 h-6 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {c.logoUrl
                        ? <img src={c.logoUrl} alt="" className="w-full h-full object-cover" />
                        : <Building2 className="w-3 h-3 text-gray-400" strokeWidth={2} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold truncate">{c.name}</div>
                      <div className="text-[10.5px] text-gray-400 truncate">{c.industry || '—'}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </aside>
      </div>

      {/* Create Company modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-[17px] font-extrabold">Create Company Page</h3>
              <button onClick={() => setShowCreate(false)} aria-label="Close" className="text-gray-400 hover:text-gray-700 transition">
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
            <p className="text-[12.5px] text-gray-400 mb-5">Free — connect with thousands of streamers</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Logo</label>
                <ImageUpload
                  kind="company-logo"
                  value={createForm.logoUrl}
                  onChange={(url) => setCreateForm({ ...createForm, logoUrl: url })}
                  label="Upload logo"
                />
                <div className="text-[10.5px] text-gray-400 mt-1">Square — appears on cards and in the page header.</div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Cover image</label>
                <ImageUpload
                  kind="banner"
                  value={createForm.bannerUrl}
                  onChange={(url) => setCreateForm({ ...createForm, bannerUrl: url })}
                  label="Upload cover"
                />
                <div className="text-[10.5px] text-gray-400 mt-1">Wide banner shown above your page header. Recommended 1500×400.</div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Company Name *</label>
                <input type="text" placeholder="e.g. RedBull Gaming"
                  className="w-full h-10 bg-bg border border-gray-200 rounded-xl px-3 text-[13px] outline-none focus:border-accent"
                  value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Industry *</label>
                <select className="w-full h-10 bg-bg border border-gray-200 rounded-xl px-3 text-[13px] outline-none focus:border-accent"
                  value={createForm.industry} onChange={e => setCreateForm({ ...createForm, industry: e.target.value })}>
                  <option value="">Select industry…</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Website</label>
                  <input type="url" placeholder="https://yourcompany.com"
                    className="w-full h-10 bg-bg border border-gray-200 rounded-xl px-3 text-[13px] outline-none focus:border-accent"
                    value={createForm.website} onChange={e => setCreateForm({ ...createForm, website: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Location</label>
                  <input type="text" placeholder="Istanbul, TR"
                    className="w-full h-10 bg-bg border border-gray-200 rounded-xl px-3 text-[13px] outline-none focus:border-accent"
                    value={createForm.location} onChange={e => setCreateForm({ ...createForm, location: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Description</label>
                <textarea rows={3} placeholder="Tell creators about your brand and what you're looking for…"
                  className="w-full bg-bg border border-gray-200 rounded-xl p-3 text-[13px] outline-none focus:border-accent resize-none"
                  value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-2">Partnership Types</label>
                <div className="grid grid-cols-2 gap-2">
                  {PARTNERSHIP_TYPES.map(pt => (
                    <button key={pt} type="button" onClick={() => togglePartnerType(pt)}
                      className={`py-2 px-3 rounded-xl border text-[11.5px] font-bold text-left transition
                        ${createForm.looking_for.includes(pt) ? 'border-accent bg-accent-lt text-accent' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {pt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 inline-flex items-center gap-1.5 w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[12px] text-emerald-700 font-semibold">
              <Check className="w-3.5 h-3.5" strokeWidth={3} />
              Free tier — your first 2 creator messages per day are free.
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={handleCreate} disabled={!createForm.name.trim() || !createForm.industry || creating}
                className="flex-1 h-11 inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dk text-white font-bold rounded-full disabled:opacity-50 transition">
                {creating ? <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} /> Creating…</> : 'Create Page'}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-5 border border-gray-200 rounded-full text-[13px] font-semibold text-gray-500 hover:border-gray-400 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Company modal */}
      {showEdit && editForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowEdit(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-[17px] font-extrabold">Edit Company Page</h3>
              <button onClick={() => setShowEdit(false)} aria-label="Close" className="text-gray-400 hover:text-gray-700 transition">
                <X className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>
            <p className="text-[12.5px] text-gray-400 mb-5">{selected?.name}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Logo</label>
                <ImageUpload
                  kind="company-logo"
                  value={editForm.logoUrl}
                  onChange={(url) => setEditForm({ ...editForm, logoUrl: url })}
                  label={editForm.logoUrl ? 'Replace logo' : 'Upload logo'}
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Cover image</label>
                <ImageUpload
                  kind="banner"
                  value={editForm.bannerUrl}
                  onChange={(url) => setEditForm({ ...editForm, bannerUrl: url })}
                  label={editForm.bannerUrl ? 'Replace cover' : 'Upload cover'}
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Company Name</label>
                <input type="text" value={editForm.name}
                  onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full h-10 bg-bg border border-gray-200 rounded-xl px-3 text-[13px] outline-none focus:border-accent" />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Industry</label>
                <select value={editForm.industry}
                  onChange={e => setEditForm({ ...editForm, industry: e.target.value })}
                  className="w-full h-10 bg-bg border border-gray-200 rounded-xl px-3 text-[13px] outline-none focus:border-accent">
                  <option value="">—</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Website</label>
                  <input type="url" value={editForm.website}
                    onChange={e => setEditForm({ ...editForm, website: e.target.value })}
                    className="w-full h-10 bg-bg border border-gray-200 rounded-xl px-3 text-[13px] outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Location</label>
                  <input type="text" value={editForm.location}
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full h-10 bg-bg border border-gray-200 rounded-xl px-3 text-[13px] outline-none focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-1.5">Description</label>
                <textarea rows={3} value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full bg-bg border border-gray-200 rounded-xl p-3 text-[13px] outline-none focus:border-accent resize-none" />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-gray-500 mb-2">Partnership Types</label>
                <div className="grid grid-cols-2 gap-2">
                  {PARTNERSHIP_TYPES.map(pt => (
                    <button key={pt} type="button"
                      onClick={() => setEditForm(f => ({ ...f, looking_for: f.looking_for.includes(pt) ? f.looking_for.filter(x => x !== pt) : [...f.looking_for, pt] }))}
                      className={`py-2 px-3 rounded-xl border text-[11.5px] font-bold text-left transition
                        ${editForm.looking_for.includes(pt) ? 'border-accent bg-accent-lt text-accent' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {pt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={saveEdit} disabled={savingEdit || !editForm.name.trim()}
                className="flex-1 h-11 inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-dk text-white font-bold rounded-full disabled:opacity-50 transition">
                {savingEdit ? <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} /> Saving…</> : 'Save Changes'}
              </button>
              <button onClick={() => setShowEdit(false)} className="px-5 border border-gray-200 rounded-full text-[13px] font-semibold text-gray-500 hover:border-gray-400 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
