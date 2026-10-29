'use client'
// Creator signup (Figma "StreamLink | Landing Login" → Aprovado, Oct 2026).
//   /register                 → "What describes you best?" account-type cards
//   /register?type=streamer   → Streamer form
//   /register?type=influencer → Influencer form
// Brand / company signup lives at /register/company.
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Briefcase, User, Video } from 'lucide-react'
import { authApi, profileApi } from '@/lib/api-client'
import { useAuthStore } from '@/lib/store'
import { COUNTRIES, LANGUAGES } from '@/lib/countries'
import {
  EMAIL_RE, INFLUENCER_NICHES, STREAMER_CATEGORIES, STREAMER_PLATFORMS,
  generateHandle, localeDefaults, safeNext,
} from '@/lib/signup'
import {
  ChipGroup, Eyebrow, FormAlert, FormTitle, PrimaryButton, ROLE_COLORS,
  SelectField, SignupShell, TextArea, TextField,
} from '@/components/auth/AuthUI'

const ACCOUNT_TYPES = [
  {
    key: 'streamer', title: 'Streamer', Icon: Video, href: '/register?type=streamer',
    text: 'You create live content on Twitch, YouTube Live, Kick, or other platforms.',
  },
  {
    key: 'influencer', title: 'Influencer', Icon: User, href: '/register?type=influencer',
    text: 'You create content on Instagram, TikTok, YouTube, or other social platforms.',
  },
  {
    key: 'brand', title: 'Brand or Company', Icon: Briefcase, href: '/register/company',
    text: 'You represent a brand or agency looking to connect with creators.',
  },
]

function AccountTypeSelect() {
  return (
    <SignupShell backHref="/login" wide>
      <div className="text-center">
        <div className="text-[11.5px] leading-[17px] font-bold uppercase tracking-[0.18em] text-black/80">Create your account</div>
        <h1 className="pt-3 font-trap font-extrabold text-[34px] leading-[40px] sm:text-[46px] sm:leading-[51px] text-black">What describes you best?</h1>
        <p className="pt-3 text-[15px] sm:text-[16px] leading-[26px] text-black/70">Choose the profile type that fits your role on StreamLink.</p>
      </div>
      <div className="pt-10 sm:pt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ACCOUNT_TYPES.map(({ key, title, Icon, href, text }) => {
          const color = ROLE_COLORS[key]
          return (
            <Link
              key={key}
              href={href}
              className="group flex flex-col p-7 sm:p-8 sm:min-h-[286px] rounded-[20px] border-2 border-black/[0.08] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-24px_rgba(10,10,10,0.35)]">
              <span className="w-10 h-10 rounded-[10px] bg-black/[0.04] flex items-center justify-center mb-5">
                <Icon className="w-6 h-6" style={{ color }} strokeWidth={1.6} aria-hidden />
              </span>
              <span className="font-trap font-bold text-[18px] leading-[27px] text-black pb-2">{title}</span>
              <span className="text-[13px] leading-[21px] text-black/65">{text}</span>
              <span className="mt-auto pt-6 inline-flex items-center gap-1.5 text-[12px] font-bold" style={{ color }}>
                Get started
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={1.8} aria-hidden />
              </span>
            </Link>
          )
        })}
      </div>
    </SignupShell>
  )
}

const COPY = {
  streamer: {
    eyebrow: 'Streamer',
    subtitle: 'Tell us about you and your streaming career.',
    first: 'Alex', last: 'Rivera', email: 'alex@example.com',
    bio: 'Tell brands what makes you stand out…',
  },
  influencer: {
    eyebrow: 'Influencer',
    subtitle: 'Tell us what content you create.',
    first: 'Jordan', last: 'Kim', email: 'jordan@example.com',
    bio: 'Tell brands what makes you unique…',
  },
}

function CreatorForm({ type }) {
  const router = useRouter()
  const params = useSearchParams()
  const acceptSession = useAuthStore((s) => s.acceptSession)
  const copy = COPY[type]
  const color = ROLE_COLORS[type]
  const isInfluencer = type === 'influencer'

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    country: 'TR', language: 'en',
    platforms: [], category: '', niches: [], bio: '',
  })
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [loading, setLoading] = useState(false)
  const touchedLocale = useRef(false)

  // Preselect country/language from the browser locale after mount (doing it
  // during render made the server and client disagree → hydration flicker).
  useEffect(() => {
    if (touchedLocale.current) return
    const d = localeDefaults(COUNTRIES, LANGUAGES)
    setForm((f) => ({ ...f, country: d.country, language: d.language }))
  }, [])

  const set = (k) => (v) => {
    if (k === 'country' || k === 'language') touchedLocale.current = true
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => (e[k] ? { ...e, [k]: undefined } : e))
    setAlert('')
  }
  const onInput = (k) => (e) => set(k)(e.target.value)
  const toggle = (k) => (v) => set(k)(form[k].includes(v) ? form[k].filter((x) => x !== v) : [...form[k], v])

  function validate() {
    const e = {}
    if (!form.firstName.trim()) e.firstName = 'First name is required'
    if (!form.lastName.trim()) e.lastName = 'Last name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!EMAIL_RE.test(form.email.trim())) e.email = 'Enter a valid email address'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const v = validate()
    if (Object.keys(v).length) {
      setErrors(v)
      setAlert('Please fix the highlighted fields.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setLoading(true)
    setAlert('')
    const base = {
      email: form.email.trim(),
      password: form.password,
      displayName: `${form.firstName.trim()} ${form.lastName.trim()}`.slice(0, 80),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      country: form.country || undefined,
      language: form.language || 'en',
      role: isInfluencer ? 'influencer' : 'streamer',
      platforms: isInfluencer ? [] : form.platforms,
      contentCategories: isInfluencer ? form.niches : [],
    }
    try {
      // The handle is generated (the form doesn't ask for one); retry on the
      // rare collision with a fresh random suffix.
      let result
      for (let attempt = 0; ; attempt++) {
        try {
          result = await authApi.signup({ ...base, handle: generateHandle(form.firstName, form.lastName, form.email) })
          break
        } catch (err) {
          if (err.code !== 'HANDLE_TAKEN' || attempt >= 2) throw err
        }
      }
      await acceptSession(result)

      const patch = {}
      if (form.bio.trim()) patch.bio = form.bio.trim()
      if (!isInfluencer && form.category) patch.category = form.category
      if (Object.keys(patch).length) {
        try { await profileApi.updateMe(patch) } catch { /* non-fatal — editable in Settings */ }
      }
      router.replace(safeNext(params.get('next')))
    } catch (err) {
      if (err.code === 'EMAIL_TAKEN') {
        setErrors({ email: 'This email is already registered' })
        setAlert('This email is already registered. Try signing in instead.')
      } else if (err.code === 'VALIDATION_ERROR') {
        const fe = err.details?.fieldErrors || {}
        const mapped = { email: fe.email?.[0], password: fe.password?.[0], firstName: fe.firstName?.[0], lastName: fe.lastName?.[0] }
        setErrors(mapped)
        setAlert('Please check your details and try again.')
      } else {
        setAlert(err.message || 'Something went wrong. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <SignupShell backHref="/register">
      <Eyebrow color={color}>{copy.eyebrow}</Eyebrow>
      <FormTitle title="Create your profile" subtitle={copy.subtitle} />

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 pt-10">
        <FormAlert>{alert}</FormAlert>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
          <TextField id="firstName" label="First name" placeholder={copy.first} value={form.firstName} onChange={onInput('firstName')} error={errors.firstName} autoComplete="given-name" maxLength={80} />
          <TextField id="lastName" label="Last name" placeholder={copy.last} value={form.lastName} onChange={onInput('lastName')} error={errors.lastName} autoComplete="family-name" maxLength={80} />
        </div>
        <TextField id="email" type="email" label="Email" placeholder={copy.email} value={form.email} onChange={onInput('email')} error={errors.email} autoComplete="email" autoCapitalize="none" />
        <TextField id="password" type="password" label="Password" placeholder="At least 8 characters" value={form.password} onChange={onInput('password')} error={errors.password} autoComplete="new-password" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-4">
          <SelectField id="country" label="Country" value={form.country} onChange={set('country')} options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))} />
          <SelectField id="language" label="Main language" value={form.language} onChange={set('language')} options={LANGUAGES.map((l) => ({ value: l.code, label: l.name }))} />
        </div>

        {isInfluencer ? (
          <ChipGroup label="Content niches" hint="Select all that apply" options={INFLUENCER_NICHES} value={form.niches} onToggle={toggle('niches')} color={color} />
        ) : (
          <>
            <ChipGroup label="Platforms" options={STREAMER_PLATFORMS.map((p) => ({ value: p.slug, label: p.label }))} value={form.platforms} onToggle={toggle('platforms')} color={color} />
            <SelectField id="category" label="Category" placeholder="Select a category" value={form.category} onChange={set('category')} options={STREAMER_CATEGORIES} />
          </>
        )}

        <TextArea id="bio" label="Bio" placeholder={copy.bio} value={form.bio} onChange={onInput('bio')} maxLength={500} />

        <PrimaryButton loading={loading} loadingLabel="Creating your profile…">Create my profile</PrimaryButton>
      </form>

      <p className="pt-6 text-center text-[13px] text-black/50">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-black hover:underline">Sign in</Link>
      </p>
    </SignupShell>
  )
}

export default function RegisterPage() {
  const type = useSearchParams().get('type')
  if (type === 'streamer' || type === 'influencer') return <CreatorForm key={type} type={type} />
  return <AccountTypeSelect />
}
