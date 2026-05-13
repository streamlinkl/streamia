import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Key, Loader2, Mail, Settings as SettingsIcon, Trash2, User } from 'lucide-react'
import { authApi, profileApi } from '@/lib/api'
import { useAppStore, useAuthStore } from '@/lib/store'
import ImageUpload from '@/components/ui/ImageUpload'
import PlatformPicker from '@/components/ui/PlatformPicker'
import { COUNTRIES, LANGUAGES } from '@/lib/countries'

const INFLUENCER_CATEGORIES = [
  'Fashion & Style', 'Beauty', 'Fitness & Wellness', 'Lifestyle', 'Travel',
  'Food & Drinks', 'Tech & AI', 'Finance & Business', 'Entertainment', 'Gaming',
  'Education / Niche Knowledge', 'Dating & Relationships', 'Adult Content',
]

const TABS = [
  { id: 'profile',  label: 'Profile',  Icon: User },
  { id: 'account',  label: 'Account',  Icon: Key },
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
    twitchUrl: profile?.twitchUrl || '',
    kickUrl: profile?.kickUrl || '',
    youtubeUrl: profile?.youtubeUrl || '',
    liveStreamUrl: profile?.liveStreamUrl || '',
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

      <Card title="Links">
        <Field label="Website">
          <input type="url" value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            placeholder="https://yoursite.com"
            className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
        </Field>
        <Field label="Twitch URL">
          <input type="url" value={form.twitchUrl}
            onChange={(e) => setForm({ ...form, twitchUrl: e.target.value })}
            placeholder="https://twitch.tv/you"
            className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
        </Field>
        <Field label="Kick URL">
          <input type="url" value={form.kickUrl}
            onChange={(e) => setForm({ ...form, kickUrl: e.target.value })}
            placeholder="https://kick.com/you"
            className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
        </Field>
        <Field label="YouTube URL">
          <input type="url" value={form.youtubeUrl}
            onChange={(e) => setForm({ ...form, youtubeUrl: e.target.value })}
            placeholder="https://youtube.com/@you"
            className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
        </Field>
        <Field label="Live stream URL (used by Go Live button)">
          <input type="url" value={form.liveStreamUrl}
            onChange={(e) => setForm({ ...form, liveStreamUrl: e.target.value })}
            placeholder="https://twitch.tv/you"
            className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
        </Field>
      </Card>

      <Card title="Streaming platforms" hint="Picked from the 84-platform catalog. Shows on your profile and feed.">
        <PlatformPicker value={form.platforms}
          onChange={(slugs) => setForm({ ...form, platforms: slugs })} />
      </Card>

      <Card title="Content niches" hint="Optional — useful for influencers and brand matching.">
        <div className="grid grid-cols-2 gap-1.5">
          {INFLUENCER_CATEGORIES.map((cat) => {
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
      showToast(err.message || 'Failed', 'error')
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
      <Card title="Anonymous mode for profile views" hint="When on, other users see 'Anonymous viewer' instead of your name when you visit their profile.">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[13px] font-bold">Browse anonymously</div>
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
