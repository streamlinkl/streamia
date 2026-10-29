'use client'
import { useEffect, useState } from 'react'
import { useNavigate } from '@/lib/router-shim'
import { CreditCard, ExternalLink, Key, Loader2, Mail, Settings as SettingsIcon, Trash2, User } from 'lucide-react'
import { authApi, planApi, profileApi, stripeApi, subscriptionApi } from '@/lib/api-client'
import UpgradeModal from '@/components/billing/UpgradeModal'
import { useAppStore, useAuthStore } from '@/lib/store'
import ImageUpload from '@/components/ImageUpload'
import PlatformPicker from '@/components/PlatformPicker'
import { COUNTRIES, LANGUAGES } from '@/lib/countries'
// Same niche list as signup; niches saved under the previous list still render (see the map below).
import { INFLUENCER_NICHES } from '@/lib/signup'

// "facebook-live" → "Facebook Live" for platform-link field labels.
const platformLabel = (slug) => slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')


const TABS = [
  { id: 'profile',  label: 'Profile',  Icon: User },
  { id: 'account',  label: 'Account',  Icon: Key },
  { id: 'billing',  label: 'Billing',  Icon: CreditCard },
  { id: 'privacy',  label: 'Privacy',  Icon: SettingsIcon },
]

export default function SettingsPage() {
  const { user, profile, fetchProfile, signOut } = useAuthStore()
  const { showToast } = useAppStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState('profile')

  return (
    <div className="max-w-[800px] mx-auto px-4 py-5">
      <h1 className="inline-flex items-center gap-2 text-[22px] font-extrabold tracking-tight mb-4">
        <SettingsIcon className="w-5 h-5" strokeWidth={2.5} />
        Settings
      </h1>
      <div className="flex items-center gap-px border-b border-gray-200 mb-4">
        {TABS.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`relative inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold transition
              ${tab === id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}>
            <Icon className="w-4 h-4" strokeWidth={2.25} />
            {label}
            {tab === id && <span className="absolute left-0 right-0 bottom-[-1px] h-[2px] bg-gray-900 rounded" />}
          </button>
        ))}
      </div>

      {tab === 'profile'  && <ProfileTab profile={profile} showToast={showToast} refresh={fetchProfile} />}
      {tab === 'account'  && <AccountTab user={user} showToast={showToast} />}
      {tab === 'billing'  && <SubscriptionTab showToast={showToast} />}
      {tab === 'privacy'  && <PrivacyTab showToast={showToast} signOut={signOut} navigate={navigate} />}
    </div>
  )
}

// ── Profile tab — full editor (banner, avatar, all profile fields) ──
function ProfileTab({ profile, showToast, refresh }) {
  const [form, setForm] = useState({
    displayName: profile?.displayName || '',
    handle: profile?.handle || '',
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    bio: profile?.bio || '',
    category: profile?.category || '',
    country: profile?.country || '',
    language: profile?.language || 'en',
    location: profile?.location || '',
    website: profile?.website || '',
    platformLinks: profile?.platformLinks || {},
    featuredPlatforms: profile?.featuredPlatforms || [],
    platforms: profile?.platforms || [],
    contentCategories: profile?.contentCategories || [],
    avatarUrl: profile?.avatarUrl || '',
    bannerUrl: profile?.bannerUrl || '',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const patch = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
      )
      // Drop empty platform-link URLs so we don't store blanks.
      patch.platformLinks = Object.fromEntries(
        Object.entries(form.platformLinks || {}).filter(([, v]) => v && v.trim())
      )
      await profileApi.updateMe(patch)
      showToast('Profile updated')
      await refresh()
    } catch (err) {
      if (err.code === 'HANDLE_TAKEN') showToast('That handle is already taken', 'error')
      else showToast(err.message || 'Failed', 'error')
    }
    setSaving(false)
  }

  const toggleNiche = (cat) => {
    setForm((f) => ({
      ...f,
      contentCategories: f.contentCategories.includes(cat)
        ? f.contentCategories.filter((c) => c !== cat)
        : [...f.contentCategories, cat],
    }))
  }

  return (
    <div className="space-y-4">
      <Card title="Photos" hint="Your cover and profile photo show up on every page you appear on.">
        <Field label="Profile photo">
          <ImageUpload kind="avatar" value={form.avatarUrl}
            onChange={(url) => setForm({ ...form, avatarUrl: url })}
            label={form.avatarUrl ? 'Replace photo' : 'Upload photo'} />
        </Field>
        <Field label="Cover image">
          <ImageUpload kind="banner" value={form.bannerUrl}
            onChange={(url) => setForm({ ...form, bannerUrl: url })}
            label={form.bannerUrl ? 'Replace cover' : 'Upload cover'} />
        </Field>
      </Card>

      <Card title="Basics">
        <div className="grid grid-cols-2 gap-3">
          <Field label="First name">
            <input type="text" value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
          </Field>
          <Field label="Last name">
            <input type="text" value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Display name">
            <input type="text" value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
          </Field>
          <Field label="Handle">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
              <input type="text" value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                className="w-full h-10 bg-bg border border-gray-200 rounded-lg pl-7 pr-3 text-sm outline-none focus:border-accent" />
            </div>
          </Field>
        </div>
        <Field label="Bio">
          <textarea rows={3} value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full bg-bg border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-accent resize-none" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <input type="text" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. FPS, Just Chatting"
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
          </Field>
          <Field label="Location">
            <input type="text" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Country">
            <select value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent">
              <option value="">—</option>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Language">
            <select value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent">
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </Field>
        </div>
      </Card>

      <Card title="Website">
        <Field label="Website">
          <input type="url" value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://yoursite.com"
            className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
        </Field>
      </Card>

      <Card title="Streaming platforms" hint="Pick your platforms, then add your link for each. Up to 3 show as badges on your profile.">
        <PlatformPicker value={form.platforms}
          onChange={(slugs) => setForm((f) => {
            const links = {}
            slugs.forEach((s) => { if (f.platformLinks[s]) links[s] = f.platformLinks[s] })
            const featured = (f.featuredPlatforms || []).filter((s) => slugs.includes(s))
            return { ...f, platforms: slugs, platformLinks: links, featuredPlatforms: featured }
          })} />
        {form.platforms.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
            <div className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
              Platform links <span className="text-gray-400 font-semibold normal-case">(optional — opens in a new tab)</span>
            </div>
            {form.platforms.map((slug) => (
              <div key={slug} className="flex items-center gap-2">
                <span className="w-32 flex-shrink-0 text-[12.5px] font-semibold text-gray-600 truncate">{platformLabel(slug)}</span>
                <input type="url" value={form.platformLinks[slug] || ''}
                  onChange={(e) => setForm((f) => ({ ...f, platformLinks: { ...f.platformLinks, [slug]: e.target.value } }))}
                  placeholder="https://…"
                  className="flex-1 min-w-0 h-9 bg-bg border border-gray-200 rounded-lg px-3 text-[13px] outline-none focus:border-accent" />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Content niches" hint="Optional — useful for influencers and brand matching.">
        <div className="grid grid-cols-2 gap-1.5">
          {[...INFLUENCER_NICHES, ...form.contentCategories.filter((c) => !INFLUENCER_NICHES.includes(c))].map((cat) => {
            const active = form.contentCategories.includes(cat)
            return (
              <button key={cat} type="button" onClick={() => toggleNiche(cat)}
                className={`text-left py-1.5 px-2.5 rounded-lg border text-[11px] font-bold transition
                  ${active ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-500 hover:border-gray-400'}`}>
                {cat}
              </button>
            )
          })}
        </div>
      </Card>

      <div className="sticky bottom-3 flex justify-end">
        <button onClick={save} disabled={saving}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-[13px] font-bold rounded-full shadow-lg transition disabled:opacity-50">
          {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} /> Saving…</> : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

function AccountTab({ user, showToast }) {
  const [email, setEmail] = useState('')
  const [emailPw, setEmailPw] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const changeEmail = async () => {
    if (!email.includes('@') || !emailPw) return
    setEmailLoading(true)
    try {
      await authApi.changeEmail(email, emailPw)
      showToast('Verification link sent to new email — confirm to activate.')
      setEmail('')
      setEmailPw('')
    } catch (err) {
      if (err.code === 'WRONG_PASSWORD') showToast('Current password is wrong', 'error')
      else if (err.code === 'EMAIL_TAKEN') showToast('That email is already in use', 'error')
      else showToast(err.message || 'Failed', 'error')
    }
    setEmailLoading(false)
  }

  const changePassword = async () => {
    if (newPw.length < 8) return showToast('Password must be at least 8 characters', 'error')
    if (newPw !== confirmPw) return showToast('Passwords do not match', 'error')
    setPwLoading(true)
    try {
      await authApi.changePassword(curPw, newPw)
      showToast('Password changed — other sessions were signed out.')
      setCurPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      if (err.code === 'WRONG_PASSWORD') showToast('Current password is wrong', 'error')
      else showToast(err.message || 'Failed', 'error')
    }
    setPwLoading(false)
  }

  return (
    <div className="space-y-4">
      <Card title="Email address" hint={`Current: ${user?.email}${user?.emailVerified ? '' : ' (not verified)'}`}>
        <Field label="New email">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="new@example.com"
            className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
        </Field>
        <Field label="Current password">
          <input type="password" value={emailPw} onChange={(e) => setEmailPw(e.target.value)}
            className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
        </Field>
        <PrimaryButton onClick={changeEmail} loading={emailLoading}>
          <Mail className="w-3.5 h-3.5" strokeWidth={2.5} /> Change email
        </PrimaryButton>
      </Card>

      <Card title="Password" hint="Changing your password signs out all other sessions.">
        <Field label="Current password">
          <input type="password" value={curPw} onChange={(e) => setCurPw(e.target.value)}
            autoComplete="current-password"
            className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="New password">
            <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
              autoComplete="new-password" minLength={8}
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
          </Field>
          <Field label="Confirm new password">
            <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
              autoComplete="new-password" minLength={8}
              className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
          </Field>
        </div>
        <PrimaryButton onClick={changePassword} loading={pwLoading}>
          <Key className="w-3.5 h-3.5" strokeWidth={2.5} /> Change password
        </PrimaryButton>
      </Card>
    </div>
  )
}

function PrivacyTab({ showToast, signOut, navigate }) {
  const { profile, fetchProfile } = useAuthStore()
  const [pw, setPw] = useState('')
  const [loading, setLoading] = useState(false)
  const [anonSaving, setAnonSaving] = useState(false)
  const anonymous = Boolean(profile?.anonymousViews)

  const toggleAnonymous = async (next) => {
    setAnonSaving(true)
    try {
      await profileApi.updateMe({ anonymousViews: next })
      await fetchProfile()
      showToast(next ? 'You will now appear as anonymous when viewing profiles' : 'Your visits will be visible to other users')
    } catch (err) {
      // Faz 8 Block F — backend gates Silent Mode behind Premium subscription.
      if (err.code === 'PREMIUM_REQUIRED') {
        showToast('Silent Mode is a Premium feature. Upgrade to browse anonymously.', 'error')
        navigate('/pricing')
      } else {
        showToast(err.message || 'Failed', 'error')
      }
    }
    setAnonSaving(false)
  }

  const del = async () => {
    if (!window.confirm('This will permanently delete your account and all content. Continue?')) return
    setLoading(true)
    try {
      await authApi.deleteAccount(pw)
      showToast('Account deleted')
      await signOut()
      navigate('/', { replace: true })
    } catch (err) {
      if (err.code === 'WRONG_PASSWORD') showToast('Password is wrong', 'error')
      else showToast(err.message || 'Failed', 'error')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <Card title="Silent Mode — anonymous profile views" hint="When on, other users see 'Anonymous viewer' instead of your name when you visit their profile.">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-bold inline-flex items-center gap-1.5">
              Browse anonymously
              <span className="inline-flex items-center text-[9.5px] font-extrabold tracking-wider text-accent uppercase bg-accent-lt px-1.5 py-px rounded">Premium</span>
            </div>
            <div className="text-[11.5px] text-gray-400 mt-0.5">{anonymous ? 'You are currently anonymous' : 'Your name appears on profiles you visit'}</div>
          </div>
          <button
            onClick={() => toggleAnonymous(!anonymous)}
            disabled={anonSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50
              ${anonymous ? 'bg-accent' : 'bg-gray-300'}`}
            aria-pressed={anonymous}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${anonymous ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </Card>

      <Card title="Delete account" hint="This removes your profile, posts, messages, connections and subscription. There is no undo." danger>
        <Field label="Current password">
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
            className="w-full h-10 bg-bg border border-red-200 rounded-lg px-3 text-sm outline-none focus:border-red-500" />
        </Field>
        <button
          onClick={del}
          disabled={!pw || loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-[12.5px] font-bold rounded-full transition disabled:opacity-50">
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
          {loading ? 'Deleting…' : 'Delete my account'}
        </button>
      </Card>
    </div>
  )
}

// ── UI primitives ──
const money = (cents) => `$${((cents ?? 0) / 100).toFixed((cents ?? 0) % 100 === 0 ? 0 : 2)}`

function SubscriptionTab({ showToast }) {
  const [sub, setSub] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [confirm, setConfirm] = useState(null) // { clientSecret, name } when an upgrade needs 3-D Secure

  const load = () => {
    setLoading(true)
    Promise.all([subscriptionApi.me(), planApi.list().catch(() => [])])
      .then(([s, p]) => {
        setSub(s)
        setPlans(Array.isArray(p) ? p : p?.items ?? [])
      })
      .catch((e) => showToast(e.message || 'Could not load subscription', 'error'))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const openPortal = async () => {
    setBusy('portal')
    try {
      const { url } = await stripeApi.portal(window.location.href)
      if (url) window.location.href = url
      else showToast('Billing portal unavailable', 'error')
    } catch (e) {
      showToast(e.code === 'NO_CUSTOMER' ? 'No billing account yet.' : e.message || 'Could not open billing portal', 'error')
    } finally {
      setBusy('')
    }
  }

  const cancel = async () => {
    if (!window.confirm('Cancel your subscription at the end of the current period?')) return
    setBusy('cancel')
    try {
      await subscriptionApi.cancel()
      showToast('Subscription will cancel at the period end.')
      load()
    } catch (e) {
      showToast(e.message || 'Could not cancel', 'error')
    } finally {
      setBusy('')
    }
  }

  const resume = async () => {
    setBusy('resume')
    try {
      await subscriptionApi.resume()
      showToast('Your subscription will continue.')
      load()
    } catch (e) {
      showToast(e.message || 'Could not resume', 'error')
    } finally {
      setBusy('')
    }
  }

  const change = async (target, isUpgrade) => {
    const msg = isUpgrade
      ? `Upgrade to ${target.name} now? You'll be charged the prorated difference immediately.`
      : `Downgrade to ${target.name}? It takes effect at the end of your current period — you keep your current plan until then.`
    if (!window.confirm(msg)) return
    setBusy('change:' + target.key)
    try {
      const r = await subscriptionApi.change(target.key)
      if (r.effect === 'action_required' && r.clientSecret) {
        // Card needs 3-D Secure / SCA — open the confirm step.
        setConfirm({ clientSecret: r.clientSecret, name: target.name })
        return
      }
      if (r.effect === 'upgraded') showToast(`Upgraded to ${target.name}.`)
      else if (r.effect === 'downgraded') showToast(`Downgrade to ${target.name} scheduled for your period end.`)
      else showToast('No change made.')
      load()
    } catch (e) {
      showToast(e.message || 'Could not change plan', 'error')
    } finally {
      setBusy('')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-accent animate-spin" strokeWidth={2.5} />
      </div>
    )
  }

  const plan = sub?.plan ?? 'free'
  const isPaid = plan !== 'free'
  const periodEnd = sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null
  const pendingAt = sub?.pendingPlanAt ? new Date(sub.pendingPlanAt) : null
  const cancelling = Boolean(sub?.cancelAtPeriodEnd)
  const currentRow = plans.find((p) => p.key === plan)
  const currentAmount = currentRow?.amountMonthly ?? 0
  // Only offer switches within the same audience (brands move Starter↔Featured;
  // creators stay on the creator tiers) — never cross-sell a brand plan to a
  // streamer.
  const GROUPS = { creator: ['premium', 'pro', 'business'], brand: ['starter', 'featured'] }
  const myGroup = GROUPS.brand.includes(plan) ? 'brand' : 'creator'
  const others = plans
    .filter((p) => p.key !== plan && (p.amountMonthly ?? 0) > 0 && GROUPS[myGroup].includes(p.key))
    .sort((a, b) => (a.amountMonthly ?? 0) - (b.amountMonthly ?? 0))

  return (
    <div className="space-y-4">
      <Card title="Your plan" hint="Manage your subscription and billing.">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-extrabold">{isPaid ? currentRow?.name || plan : 'Free plan'}</div>
            <div className="text-[12.5px] text-gray-400 mt-0.5">
              {isPaid
                ? `Status: ${sub?.status ?? '—'}${periodEnd ? ` · ${cancelling ? 'ends' : 'renews'} ${periodEnd.toLocaleDateString()}` : ''}`
                : 'You are on the free plan.'}
            </div>
          </div>
          {!isPaid && <PrimaryButton onClick={() => setShowUpgrade(true)}>Upgrade</PrimaryButton>}
        </div>

        {sub?.pendingPlan && (
          <div className="mt-3 text-[12.5px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Scheduled: switches to <span className="font-extrabold">{plans.find((p) => p.key === sub.pendingPlan)?.name || sub.pendingPlan}</span>
            {pendingAt ? ` on ${pendingAt.toLocaleDateString()}` : ''}.
          </div>
        )}
        {cancelling && (
          <div className="mt-3 flex items-center justify-between gap-3 text-[12.5px] font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <span>Cancels at the period end{periodEnd ? ` (${periodEnd.toLocaleDateString()})` : ''}.</span>
            <button onClick={resume} disabled={busy === 'resume'} className="font-extrabold text-accent hover:underline disabled:opacity-60">
              Keep plan
            </button>
          </div>
        )}
      </Card>

      {isPaid && others.length > 0 && (
        <Card title="Change plan" hint="Upgrade now (prorated) or downgrade from next period.">
          <div className="space-y-2">
            {others.map((p) => {
              const isUpgrade = (p.amountMonthly ?? 0) >= currentAmount
              const busyThis = busy === 'change:' + p.key
              return (
                <div key={p.key} className="flex items-center justify-between gap-3 border border-gray-200 rounded-xl px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-extrabold">{p.name}</div>
                    <div className="text-[12px] text-gray-400">{money(p.amountMonthly)} / mo</div>
                  </div>
                  <button
                    onClick={() => change(p, isUpgrade)}
                    disabled={Boolean(busy)}
                    className={`inline-flex items-center gap-2 h-9 px-4 rounded-lg text-[12.5px] font-bold transition disabled:opacity-60 ${
                      isUpgrade ? 'btn-gradient text-white' : 'border border-gray-300 text-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {busyThis ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isUpgrade ? 'Upgrade' : 'Downgrade'}
                  </button>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {isPaid && (
        <Card title="Billing" hint="Update your card, view invoices, or cancel.">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={openPortal}
              disabled={busy === 'portal'}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-gray-300 text-[13px] font-bold text-gray-700 hover:border-gray-500 disabled:opacity-60"
            >
              {busy === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
              Manage billing
            </button>
            {!cancelling && (
              <button
                onClick={cancel}
                disabled={busy === 'cancel'}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-red-200 text-[13px] font-bold text-red-600 hover:border-red-400 disabled:opacity-60"
              >
                {busy === 'cancel' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Cancel subscription
              </button>
            )}
          </div>
        </Card>
      )}

      {showUpgrade && (
        <UpgradeModal
          plan="premium"
          billing="monthly"
          title="Upgrade to Premium"
          onClose={() => setShowUpgrade(false)}
          onSuccess={() => { window.location.href = '/profile?upgraded=true' }}
        />
      )}

      {confirm && (
        <UpgradeModal
          title="Confirm your upgrade"
          subtitle={`Authorize the payment to switch to ${confirm.name}`}
          paymentClientSecret={confirm.clientSecret}
          onClose={() => setConfirm(null)}
          onSuccess={() => { setConfirm(null); showToast('Upgrade complete.'); load() }}
        />
      )}
    </div>
  )
}

function Card({ title, hint, children, danger }) {
  return (
    <div className={`bg-white border rounded-2xl shadow-sm p-5 ${danger ? 'border-red-200' : 'border-gray-200'}`}>
      <div className="mb-4">
        <div className={`text-[14px] font-extrabold ${danger ? 'text-red-700' : ''}`}>{title}</div>
        {hint && <div className="text-[11.5px] text-gray-400 mt-0.5">{hint}</div>}
      </div>
      <div className="space-y-3">{children}</div>
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

function PrimaryButton({ onClick, loading, children }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white text-[12.5px] font-bold rounded-full transition disabled:opacity-50">
      {loading ? 'Saving…' : children}
    </button>
  )
}
