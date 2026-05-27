'use client'
import { useState } from 'react'
import { Link, useNavigate } from '@/lib/router-shim'
import { authApi, companyApi, profileApi } from '@/lib/api-client'
import { useAuthStore } from '@/lib/store'
import ImageUpload from '@/components/ImageUpload'
import { COUNTRIES } from '@/lib/countries'

const INDUSTRIES = [
  'Esports', 'Gaming Hardware', 'Energy & Beverages', 'Streaming Platform',
  'Talent Agency', 'Game Publisher', 'Apparel', 'Tech & Software',
  'Food & Beverage', 'Finance & Crypto', 'Health & Fitness', 'Other'
]

const PARTNERSHIP_TYPES = [
  'Sponsored Streams', 'Brand Ambassadors', 'Product Reviews',
  'Event Coverage', 'Long-term Deals', 'Affiliate Programs'
]

// docx task #2 sub-categories. Token order matches backend zod enum.
const AGENCY_TYPES = [
  { key: 'influencer', label: 'Influencer Agency' },
  { key: 'streamer',   label: 'Streamer Agency' },
  { key: 'affiliate',  label: 'Affiliate Agency' },
  { key: 'models',     label: 'Models Agency' },
  { key: 'marketing',  label: 'Marketing Agency' },
]

const STEPS = ['Account', 'Company', 'Partnerships', 'Done']

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 30) || 'company'
}

export default function RegisterCompanyPage() {
  const navigate = useNavigate()
  const acceptSession = useAuthStore((s) => s.acceptSession)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [form, setForm] = useState({
    // Step 1 — Account
    account_type: 'brand',          // 'brand' | 'agency' — docx task #2
    agency_type: 'influencer',      // one of AGENCY_TYPES keys; ignored when account_type='brand'
    email: '',
    password: '',
    contact_first_name: '',
    contact_last_name: '',
    contact_name: '',
    // Step 2 — Company info
    company_name: '',
    industry: '',
    website: '',
    country: 'TR',
    location: '',
    description: '',
    logo_url: '',
    // Step 3 — Partnerships
    looking_for: [],
    budget_min: '',
    budget_max: '',
  })

  const update = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrorMsg('')
  }

  const togglePartner = (pt) => {
    setForm(f => ({
      ...f,
      looking_for: f.looking_for.includes(pt)
        ? f.looking_for.filter(x => x !== pt)
        : [...f.looking_for, pt]
    }))
  }

  // STEP 1 — Create auth account (uses the contact's display_name + a provisional handle)
  const handleStep1 = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (form.password.length < 8) { setErrorMsg('Password must be at least 8 characters'); return }
    setLoading(true)

    try {
      // We need a handle at signup time; derive one from the contact name or email.
      const baseHandle = form.contact_name.replace(/[^a-zA-Z0-9]/g, '') ||
        (form.email.split('@')[0] || '').replace(/[^a-zA-Z0-9]/g, '') ||
        'brand'
      const tentativeHandle = (baseHandle + Date.now().toString(36)).slice(0, 20).toLowerCase()

      const isAgency = form.account_type === 'agency'
      const fullName = [form.contact_first_name, form.contact_last_name].filter(Boolean).join(' ').trim()
      const result = await authApi.signup({
        email: form.email.trim(),
        password: form.password,
        displayName: fullName || form.contact_name.trim() || (isAgency ? 'Agency' : 'Brand'),
        handle: tentativeHandle,
        firstName: form.contact_first_name.trim() || null,
        lastName: form.contact_last_name.trim() || null,
        country: form.country || undefined,
        language: 'en',
        role: isAgency ? 'agency' : 'company',
        agencyType: isAgency ? form.agency_type : undefined,
      })
      await acceptSession(result)
      setStep(2)
    } catch (err) {
      if (err.code === 'EMAIL_TAKEN') setErrorMsg('This email is already registered. Try signing in.')
      else setErrorMsg(err.message || 'Could not create account')
    } finally {
      setLoading(false)
    }
  }

  // STEP 2 — Company info (just validate + advance)
  const handleStep2 = (e) => {
    e.preventDefault()
    setErrorMsg('')
    if (!form.company_name.trim()) { setErrorMsg('Company name is required'); return }
    if (!form.industry) { setErrorMsg('Please select your industry'); return }
    setStep(3)
  }

  // STEP 3 — Save everything to DB
  const handleStep3 = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      await companyApi.create({
        name: form.company_name.trim(),
        slug: slugify(form.company_name),
        industry: form.industry || null,
        website: form.website || null,
        description: form.description || null,
        lookingFor: form.looking_for,
        location: form.location || null,
        logoUrl: form.logo_url || null,
      })

      // Update the streamer profile we created at signup to look like a brand
      try {
        await profileApi.updateMe({
          displayName: form.company_name.trim(),
          bio: form.description || null,
          category: 'Brand / Company',
          location: form.location || null,
          website: form.website || null,
        })
      } catch { /* non-fatal */ }

      setStep(4)
    } catch (err) {
      if (err.code === 'SLUG_TAKEN') setErrorMsg('A company with that name already exists. Try a different one.')
      else setErrorMsg(err.message || 'Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const goToDashboard = () => navigate('/companies')

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-md p-8">

        {/* Logo */}
        <div className="flex items-center gap-2 text-[17px] font-extrabold tracking-tight mb-6">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-white">⚡</div>
          Stream <span className="text-accent">Link</span>
          <span className="ml-2 text-[11px] bg-purple-100 text-purple-700 font-extrabold px-2 py-0.5 rounded-full">FOR BRANDS</span>
        </div>

        {/* Step indicator */}
        {step < 4 && (
          <div className="flex items-center gap-1 mb-6">
            {STEPS.slice(0, 3).map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1">
                <div className={`w-6 h-6 rounded-full text-[11px] font-extrabold flex items-center justify-center flex-shrink-0
                  ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-accent text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <div className={`text-[11px] font-bold ${step === i + 1 ? 'text-gray-900' : 'text-gray-400'}`}>{s}</div>
                {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-1" />}
              </div>
            ))}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[12.5px] text-red-700 font-semibold leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* ── STEP 1: Account ── */}
        {step === 1 && (
          <>
            <h1 className="text-[22px] font-extrabold mb-1">
              {form.account_type === 'agency' ? 'Create agency account' : 'Create brand account'}
            </h1>
            <p className="text-sm text-gray-400 mb-5">
              {form.account_type === 'agency'
                ? 'Manage talent and partnerships for your roster'
                : 'Connect with thousands of streamers'}
            </p>

            {/* Account type selector (docx task #2) */}
            <fieldset className="mb-4">
              <legend className="block text-xs font-bold text-gray-500 mb-2">I'm signing up as a</legend>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'brand',  label: 'Brand',  hint: 'I run a company or product' },
                  { key: 'agency', label: 'Agency', hint: 'I manage creators or talent' },
                ].map((opt) => {
                  const active = form.account_type === opt.key
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => update('account_type', opt.key)}
                      aria-pressed={active}
                      className={`text-left px-3 py-2.5 rounded-xl border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
                        ${active ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="text-[13px] font-extrabold text-gray-900">{opt.label}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{opt.hint}</div>
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {form.account_type === 'agency' && (
              <fieldset className="mb-4">
                <legend className="block text-xs font-bold text-gray-500 mb-2">What kind of agency?</legend>
                <div className="grid grid-cols-1 gap-1.5">
                  {AGENCY_TYPES.map((opt) => {
                    const active = form.agency_type === opt.key
                    return (
                      <label
                        key={opt.key}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border cursor-pointer transition
                          ${active ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <input
                          type="radio"
                          name="agency_type"
                          value={opt.key}
                          checked={active}
                          onChange={() => update('agency_type', opt.key)}
                          className="w-4 h-4 accent-accent"
                        />
                        <span className="text-[13px] font-semibold text-gray-800">{opt.label}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            )}

            <form onSubmit={handleStep1} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">First name</label>
                  <input required type="text"
                    className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                    placeholder="John"
                    value={form.contact_first_name}
                    onChange={e => update('contact_first_name', e.target.value)}
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Last name</label>
                  <input required type="text"
                    className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                    placeholder="Smith"
                    value={form.contact_last_name}
                    onChange={e => update('contact_last_name', e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Work Email</label>
                <input required type="email"
                  className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
                <input required type="password" minLength={8}
                  className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" disabled={loading}
                className="w-full h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating…</> : 'Continue →'}
              </button>
            </form>
          </>
        )}

        {/* ── STEP 2: Company Info ── */}
        {step === 2 && (
          <>
            <h1 className="text-[22px] font-extrabold mb-1">Tell us about your brand</h1>
            <p className="text-sm text-gray-400 mb-5">This is what streamers will see on your page</p>
            <form onSubmit={handleStep2} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Company Name *</label>
                <input required type="text"
                  className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                  placeholder="e.g. RedBull Gaming"
                  value={form.company_name}
                  onChange={e => update('company_name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Industry *</label>
                <select required
                  className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                  value={form.industry}
                  onChange={e => update('industry', e.target.value)}>
                  <option value="">Select your industry…</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Country</label>
                  <select
                    className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                    value={form.country}
                    onChange={e => update('country', e.target.value)}
                  >
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Website</label>
                  <input type="url"
                    className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                    placeholder="https://…"
                    value={form.website}
                    onChange={e => update('website', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">Company Logo <span className="font-normal text-gray-300">(optional)</span></label>
                <ImageUpload
                  kind="company-logo"
                  value={form.logo_url}
                  onChange={(url) => update('logo_url', url)}
                  label="Upload logo"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Location</label>
                <input type="text"
                  className="w-full h-11 bg-bg border border-gray-200 rounded-xl px-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                  placeholder="City, Country"
                  value={form.location}
                  onChange={e => update('location', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">About your brand</label>
                <textarea rows={3}
                  className="w-full bg-bg border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-accent focus:bg-white transition resize-none"
                  placeholder="Tell streamers what your brand is about and what you're looking for…"
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex-1 h-11 border border-gray-200 text-gray-500 font-bold rounded-full text-sm hover:border-gray-400 transition">← Back</button>
                <button type="submit"
                  className="flex-1 h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-sm transition">Continue →</button>
              </div>
            </form>
          </>
        )}

        {/* ── STEP 3: Partnership preferences ── */}
        {step === 3 && (
          <>
            <h1 className="text-[22px] font-extrabold mb-1">What are you looking for?</h1>
            <p className="text-sm text-gray-400 mb-5">This helps streamers understand your needs</p>
            <form onSubmit={handleStep3} className="flex flex-col gap-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Partnership Types (select all that apply)</label>
                <div className="grid grid-cols-2 gap-2">
                  {PARTNERSHIP_TYPES.map(pt => (
                    <button key={pt} type="button" onClick={() => togglePartner(pt)}
                      className={`py-2.5 px-3 rounded-xl border text-[12px] font-bold text-left transition
                        ${form.looking_for.includes(pt) ? 'border-accent bg-accent-lt text-accent' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                      {pt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Monthly Budget Range (USD)</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                    <input type="number" placeholder="Min"
                      className="w-full h-11 bg-bg border border-gray-200 rounded-xl pl-7 pr-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                      value={form.budget_min}
                      onChange={e => update('budget_min', e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                    <input type="number" placeholder="Max"
                      className="w-full h-11 bg-bg border border-gray-200 rounded-xl pl-7 pr-3 text-sm outline-none focus:border-accent focus:bg-white transition"
                      value={form.budget_max}
                      onChange={e => update('budget_max', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Plan teaser */}
              <div className="p-4 bg-gradient-to-r from-accent/10 to-purple-50 border border-accent/20 rounded-xl">
                <div className="text-[13px] font-extrabold mb-1">🎉 You're starting on the Free plan</div>
                <div className="text-[12px] text-gray-500">1 job listing, browse creators. Upgrade to Pro ($49/mo) anytime for unlimited posts + verified badge.</div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)}
                  className="flex-1 h-11 border border-gray-200 text-gray-500 font-bold rounded-full text-sm hover:border-gray-400 transition">← Back</button>
                <button type="submit" disabled={loading}
                  className="flex-1 h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-sm transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</> : 'Create Page →'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ── STEP 4: Success ── */}
        {step === 4 && (
          <div className="text-center py-4">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-[22px] font-extrabold mb-2">Your brand page is live!</h2>
            <p className="text-[13.5px] text-gray-500 leading-relaxed mb-6">
              Welcome to Streamia! Thousands of streamers can now discover your brand. Start by posting your first job listing.
            </p>

            <div className="space-y-3 mb-6">
              {[
                { icon: '✅', text: 'Company page created' },
                { icon: '✅', text: 'Free plan activated' },
                { icon: '📧', text: 'Check email to confirm your account' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl text-left">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[13px] font-semibold text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>

            <button onClick={goToDashboard}
              className="w-full h-11 bg-accent hover:bg-accent-dk text-white font-bold rounded-full text-sm transition">
              Go to my brand dashboard →
            </button>
          </div>
        )}

        {/* Footer links */}
        {step < 4 && (
          <div className="mt-5 text-center space-y-2">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-accent font-semibold hover:underline">Sign in</Link>
            </p>
            <p className="text-sm text-gray-400">
              Are you a streamer?{' '}
              <Link to="/register" className="text-accent font-semibold hover:underline">Join as creator</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
