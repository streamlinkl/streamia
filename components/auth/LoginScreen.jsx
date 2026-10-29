'use client'
// Login screen (Figma "StreamLink | Landing Login" → Aprovado → Login, Oct 2026).
// Used by /login and as the hero of the landing page. Desktop: headline
// bottom-left, 3D hummingbird behind, frosted login card on the right.
// Mobile: logo, headline, then the card, with the bird as a backdrop.
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/api-client'
import { useAuthStore } from '@/lib/store'
import { safeNext } from '@/lib/signup'

function GoogleMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

const inputCls =
  'w-full h-[46px] rounded-[11px] border border-black/50 bg-black/[0.05] px-4 text-[14px] text-black placeholder:text-black/50 outline-none transition focus:bg-white focus:border-black'

function LoginCard() {
  const router = useRouter()
  const params = useSearchParams()
  const acceptSession = useAuthStore((s) => s.acceptSession)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [googleNote, setGoogleNote] = useState(false)

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrorMsg('')
  }

  async function handleLogin(e) {
    e.preventDefault()
    if (!form.email.trim() || !form.password) {
      setErrorMsg('Please enter your email and password.')
      return
    }
    setLoading(true)
    setErrorMsg('')
    try {
      const result = await authApi.login({ email: form.email.trim(), password: form.password })
      await acceptSession(result)
      router.replace(safeNext(params.get('next')))
    } catch (err) {
      if (err.code === 'INVALID_CREDENTIALS') setErrorMsg('Wrong email or password. Please try again.')
      else if (err.code === 'VALIDATION_ERROR') setErrorMsg('Please enter a valid email and password.')
      else setErrorMsg(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="relative w-full max-w-[480px] lg:w-[480px] rounded-[20px] bg-white/90 backdrop-blur-xl shadow-[0_24px_80px_-24px_rgba(10,10,10,0.25)] px-7 py-9 sm:p-12 font-inter">
      <h2 className="font-trap font-bold text-[24px] leading-[32px] text-black">Access your profile</h2>
      <p className="pt-1 text-[14px] leading-[20px] text-black/40">Sign in or create your creator account</p>

      {/* Sign in / Create account tabs */}
      <div className="flex gap-6 pt-8" role="tablist">
        <span role="tab" aria-selected="true" className="relative pb-1 font-trap font-semibold text-[14px] leading-[20px] text-black">
          Sign in
          <span className="absolute left-0 right-0 -bottom-px h-[2px] rounded-full bg-black" aria-hidden />
        </span>
        <Link href="/register" role="tab" aria-selected="false" className="pb-1 font-trap font-semibold text-[14px] leading-[20px] text-black/50 hover:text-black transition">
          Create account
        </Link>
      </div>

      <form onSubmit={handleLogin} className="flex flex-col gap-4 pt-8" noValidate>
        {errorMsg ? (
          <div role="alert" className="px-3.5 py-2.5 rounded-[11px] border border-red-200 bg-red-50 text-[13px] font-semibold text-red-700">{errorMsg}</div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="text-[12px] leading-4 font-semibold uppercase tracking-[0.05em] text-black/50">Email</label>
          <input id="login-email" type="email" className={inputCls} placeholder="hailey@example.com" value={form.email} onChange={set('email')} autoComplete="email" autoCapitalize="none" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-password" className="text-[12px] leading-4 font-semibold uppercase tracking-[0.05em] text-black/50">Password</label>
          <div className="relative">
            <input id="login-password" type={showPassword ? 'text' : 'password'} className={`${inputCls} pr-11`} placeholder="••••••••" value={form.password} onChange={set('password')} autoComplete="current-password" />
            <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 hover:text-black transition">
              {showPassword ? <EyeOff className="w-[18px] h-[18px]" strokeWidth={1.8} /> : <Eye className="w-[18px] h-[18px]" strokeWidth={1.8} />}
            </button>
          </div>
          <div className="flex justify-end pt-1">
            <Link href="/forgot-password" className="text-[12px] leading-4 text-black/40 hover:text-black transition">Forgot password?</Link>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="mt-1 h-[49px] w-full rounded-[12px] bg-sl-signin text-white font-trap font-bold text-[14px] tracking-[0.04em] inline-flex items-center justify-center gap-2 transition hover:opacity-95 disabled:opacity-70">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" strokeWidth={2.5} aria-hidden />Signing in…</> : 'Sign in'}
        </button>

        <div className="flex items-center gap-3 py-1 text-[12px] text-black/50">
          <span className="flex-1 h-px bg-black/10" aria-hidden />
          or
          <span className="flex-1 h-px bg-black/10" aria-hidden />
        </div>

        {/* Google sign-in isn't wired on the API yet (no OAuth provider) —
            the button stays to match the design and explains itself. */}
        <button type="button" onClick={() => setGoogleNote(true)}
          className="h-[47px] w-full rounded-[12px] border border-black/50 bg-black/[0.04] hover:bg-black/[0.07] inline-flex items-center justify-center gap-3 text-[14px] font-medium text-black/70 transition">
          <GoogleMark className="w-[18px] h-[18px]" />
          Continue with Google
        </button>
        {googleNote ? (
          <p className="-mt-1 text-center text-[12.5px] text-black/50">Google sign-in is coming soon. Please use your email for now.</p>
        ) : null}
      </form>

      <p className="pt-8 text-center text-[12px] leading-5 text-black/30">
        By continuing, you agree to StreamLink&apos;s
        <br />
        <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>.
      </p>
    </div>
  )
}

export default function LoginScreen() {
  return (
    <section aria-label="Sign in" className="relative min-h-screen lg:h-screen lg:min-h-[720px] overflow-hidden bg-white">
      {/* 3D hummingbird — Figma: 1263px square at left 20%, top −84px of a 1739px frame */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/login/hummingbird-3d-2048.webp"
        srcSet="/brand/login/hummingbird-3d-1024.webp 1024w, /brand/login/hummingbird-3d-2048.webp 2048w"
        sizes="(min-width: 1024px) 73vw, 120vw"
        alt=""
        aria-hidden
        className="pointer-events-none select-none absolute z-0 w-[120vw] max-w-none -right-[38vw] -top-[6vw] opacity-90 lg:opacity-100 lg:w-[72.6vw] lg:right-auto lg:left-[20vw] lg:-top-[4.8vw]"
      />

      <div className="relative z-10 flex flex-col min-h-screen lg:block lg:h-full">
        <header className="px-6 sm:px-10 lg:px-14 pt-8 lg:pt-12">
          <Link href="/" aria-label="StreamLink — home" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-wordmark.svg" alt="StreamLink" className="h-7 lg:h-[33px] w-auto" />
          </Link>
        </header>

        {/* Headline — bottom-left on desktop */}
        <div className="px-6 sm:px-10 lg:px-14 pt-[34vw] sm:pt-[26vw] lg:pt-0 lg:absolute lg:left-0 lg:bottom-[8vh]">
          <h1 className="font-trap font-bold text-[40px] leading-[1.1] sm:text-[52px] lg:text-[clamp(44px,3.6vw,64px)] lg:whitespace-nowrap tracking-[-0.025em] text-black">
            Where creators
            <br />
            <span className="bg-sl-headline bg-clip-text text-transparent">turn achievements</span>
            <br />
            into opportunity.
          </h1>
          <p className="pt-5 max-w-[512px] font-inter text-[16px] leading-[26px] xl:text-[18px] xl:leading-[29px] text-black/50">
            StreamLink is where creators showcase what they&apos;ve achieved, connect with agencies and brands, and discover new opportunities.
          </p>
        </div>

        {/* Login card — right side on desktop */}
        <div className="px-4 sm:px-10 pt-10 pb-12 flex justify-center lg:p-0 lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:right-[6.8vw]">
          <LoginCard />
        </div>
      </div>
    </section>
  )
}
