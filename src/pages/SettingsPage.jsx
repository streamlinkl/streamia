import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Key, Mail, Settings as SettingsIcon, Trash2, User } from 'lucide-react'
import { authApi, profileApi } from '@/lib/api'
import { useAppStore, useAuthStore } from '@/lib/store'

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

// ── Profile tab (quick-edit key fields; full editor in ProfilePage modal) ──
function ProfileTab({ profile, showToast, refresh }) {
  const [form, setForm] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    category: profile?.category || '',
    location: profile?.location || '',
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      await profileApi.updateMe({
        displayName: form.displayName || undefined,
        bio: form.bio || null,
        category: form.category || null,
        location: form.location || null,
      })
      showToast('Profile updated')
      await refresh()
    } catch (err) {
      showToast(err.message || 'Failed', 'error')
    }
    setSaving(false)
  }

  return (
    <Card title="Profile" hint="For platforms, avatar and banner use the full profile editor.">
      <Field label="Display name">
        <input type="text" value={form.displayName}
          onChange={(e) => setForm({ ...form, displayName: e.target.value })}
          className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
      </Field>
      <Field label="Bio">
        <textarea rows={3} value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          className="w-full bg-bg border border-gray-200 rounded-lg p-2.5 text-sm outline-none focus:border-accent resize-none" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <input type="text" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
        </Field>
        <Field label="Location">
          <input type="text" value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full h-10 bg-bg border border-gray-200 rounded-lg px-3 text-sm outline-none focus:border-accent" />
        </Field>
      </div>
      <PrimaryButton onClick={save} loading={saving}>Save changes</PrimaryButton>
    </Card>
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
